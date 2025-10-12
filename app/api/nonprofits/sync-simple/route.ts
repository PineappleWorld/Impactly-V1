import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Simplified sync endpoint for testing
 * Syncs only the first page of one category
 */
export async function POST(request: Request) {
  const startTime = Date.now();
  console.log('[Simple Sync] Starting...');

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get API key
    const { data: settingsData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'every_org_api_key')
      .maybeSingle();

    if (!settingsData?.value) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 400 });
    }

    const apiKey = settingsData.value;
    console.log('[Simple Sync] API key found');

    // Fetch only first page of humans category
    const category = 'humans';
    const url = `https://partners.every.org/v0.2/browse/${category}?apiKey=${apiKey}&page=1&take=10`;

    console.log(`[Simple Sync] Fetching from: ${url.substring(0, 60)}...`);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Simple Sync] API error: ${response.status} - ${errorText}`);
      return NextResponse.json({
        error: `API error: ${response.status}`,
        details: errorText.substring(0, 200)
      }, { status: 500 });
    }

    const data = await response.json();
    console.log(`[Simple Sync] Received ${data.nonprofits?.length || 0} nonprofits`);

    if (!data.nonprofits || data.nonprofits.length === 0) {
      return NextResponse.json({
        error: 'No nonprofits returned from API',
        data
      }, { status: 500 });
    }

    // Filter and prepare records
    const records = data.nonprofits
      .filter((np: any) => {
        const hasSlug = np.nonprofitSlug || np.primarySlug || np.slug;
        const hasName = np.name;
        return hasSlug && hasName;
      })
      .map((np: any) => {
        const slug = np.nonprofitSlug || np.primarySlug || np.slug ||
                      (np.name ? np.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'unknown');

        return {
          nonprofit_slug: slug,
          name: np.name,
          description: np.description || '',
          logo_url: np.logoUrl || '',
          cover_image_url: np.coverImageUrl || '',
          website_url: np.websiteUrl || '',
          ein: np.ein || '',
          primary_slug: np.primarySlug || slug,
          location_address: np.locationAddress || '',
          category,
          updated_at: new Date().toISOString(),
        };
      });

    console.log(`[Simple Sync] Filtered to ${records.length} valid records`);

    if (records.length === 0) {
      return NextResponse.json({
        error: 'No valid records after filtering',
        receivedCount: data.nonprofits.length
      }, { status: 500 });
    }

    // Insert into database
    const { error: upsertError } = await supabase
      .from('nonprofits_cache')
      .upsert(records, { onConflict: 'nonprofit_slug' });

    if (upsertError) {
      console.error('[Simple Sync] Database error:', upsertError);
      return NextResponse.json({
        error: 'Database insert failed',
        details: upsertError.message
      }, { status: 500 });
    }

    const elapsed = Date.now() - startTime;
    console.log(`[Simple Sync] Success! ${records.length} records in ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${records.length} nonprofits from ${category}`,
      recordCount: records.length,
      elapsed: `${elapsed}ms`,
      category,
    });

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error('[Simple Sync] Error:', error);

    return NextResponse.json({
      error: error.message || 'Sync failed',
      details: error.stack,
      elapsed: `${elapsed}ms`
    }, { status: 500 });
  }
}