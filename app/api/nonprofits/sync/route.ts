import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const CATEGORIES = ['animals', 'culture', 'education', 'environment', 'health', 'humans', 'research'];

async function fetchFromEveryOrg(cause: string, apiKey: string, page: number = 1) {
  const url = `https://partners.every.org/v0.2/browse/${cause}?apiKey=${apiKey}&page=${page}&take=100`;
  console.log(`[Sync] Fetching ${cause} page ${page}...`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Sync] API error for ${cause} page ${page}: ${response.status} - ${errorText}`);
    throw new Error(`API error for ${cause} page ${page}: ${response.status} - ${errorText.substring(0, 100)}`);
  }

  const data = await response.json();
  console.log(`[Sync] Received ${data.nonprofits?.length || 0} nonprofits from ${cause} page ${page}`);
  return data;
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let syncRecordId: string | null = null;

  try {
    // Get Every.org API key from settings
    const { data: settingsData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'every_org_api_key')
      .maybeSingle();

    if (!settingsData?.value) {
      return NextResponse.json({ error: 'Every.org API key not configured' }, { status: 400 });
    }

    const apiKey = settingsData.value;

    // Create sync record
    const { data: syncRecord } = await supabase
      .from('sync_status')
      .insert({ sync_type: 'nonprofits_full', status: 'in_progress' })
      .select()
      .single();

    syncRecordId = syncRecord?.id;

    let totalSynced = 0;
    const categoryResults: any[] = [];

    console.log(`[Sync] Starting sync for ${CATEGORIES.length} categories...`);

    // Sync each category
    for (const cat of CATEGORIES) {
      console.log(`[Sync] Processing category: ${cat}`);
      let categorySynced = 0;

      try {
        const firstPage = await fetchFromEveryOrg(cat, apiKey, 1);
        const totalPages = firstPage.pagination?.pages || 1;
        const totalResults = firstPage.pagination?.total_results || 0;

        console.log(`[Sync] Category ${cat}: ${totalResults} total results across ${totalPages} pages`);

        for (let page = 1; page <= totalPages; page++) {
          const pageData = page === 1 ? firstPage : await fetchFromEveryOrg(cat, apiKey, page);

          if (!pageData.nonprofits || !Array.isArray(pageData.nonprofits)) {
            console.error(`[Sync] Invalid data structure for ${cat} page ${page}`);
            continue;
          }

          // Filter and transform nonprofits, ensuring required fields exist
          const records = pageData.nonprofits
            .filter((np: any) => {
              // Must have a slug and name
              const hasSlug = np.nonprofitSlug || np.primarySlug || np.slug;
              const hasName = np.name;

              if (!hasSlug) {
                console.warn(`[Sync] Skipping nonprofit without slug: ${np.name || 'unnamed'}`);
              }
              if (!hasName) {
                console.warn(`[Sync] Skipping nonprofit without name`);
              }

              return hasSlug && hasName;
            })
            .map((np: any) => {
              // Generate slug with fallback
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
                category: cat,
                updated_at: new Date().toISOString(),
              };
            });

          if (records.length === 0) {
            console.warn(`[Sync] No valid records in ${cat} page ${page}`);
            continue;
          }

          console.log(`[Sync] Upserting ${records.length} valid records from ${cat} page ${page}`);

          const { error: upsertError } = await supabase
            .from('nonprofits_cache')
            .upsert(records, { onConflict: 'nonprofit_slug' });

          if (upsertError) {
            console.error(`[Sync] Database error for ${cat} page ${page}:`, upsertError);
            throw upsertError;
          }

          categorySynced += records.length;
          totalSynced += records.length;

          console.log(`[Sync] Progress: ${cat} - ${page}/${totalPages} pages (${categorySynced} records)`);

          // Rate limiting
          await new Promise(r => setTimeout(r, 130));
        }

        categoryResults.push({
          category: cat,
          status: 'success',
          recordsSynced: categorySynced,
        });

        console.log(`[Sync] Completed ${cat}: ${categorySynced} records`);

      } catch (error: any) {
        console.error(`[Sync] Failed to sync category ${cat}:`, error.message);
        categoryResults.push({
          category: cat,
          status: 'failed',
          error: error.message,
          recordsSynced: categorySynced,
        });
        // Continue with other categories instead of failing completely
      }
    }

    console.log(`[Sync] Sync complete. Total records: ${totalSynced}`);

    // Mark completed
    if (syncRecordId) {
      await supabase
        .from('sync_status')
        .update({ status: 'completed', total_records: totalSynced, completed_at: new Date().toISOString() })
        .eq('id', syncRecordId);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${totalSynced} nonprofits across ${CATEGORIES.length} categories`,
      totalSynced,
      categoryResults,
    });

  } catch (error: any) {
    console.error('[Sync] Fatal error during sync:', error);

    if (syncRecordId) {
      await supabase
        .from('sync_status')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', syncRecordId);
    }

    return NextResponse.json({
      error: error.message,
      details: error.stack,
      suggestion: 'Check if Every.org API key is valid and has proper permissions'
    }, { status: 500 });
  }
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data } = await supabase
    .from('sync_status')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(10);

  return NextResponse.json({ syncStatus: data });
}
