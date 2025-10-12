import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CATEGORY_MAP: Record<string, string> = {
  'animals': 'animals',
  'culture': 'culture',
  'education': 'education',
  'environment': 'environment',
  'health': 'health',
  'humans': 'humans',
  'research': 'research',
};

async function fetchFromEveryOrgLive(category: string, apiKey: string, page: number = 1, perPage: number = 100) {
  const cause = CATEGORY_MAP[category] || category;
  const url = `https://partners.every.org/v0.2/browse/${cause}?apiKey=${apiKey}&page=${page}&take=${perPage}`;

  console.log(`[Live API] Fetching ${cause} page ${page}...`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Live API] Error: ${response.status} - ${errorText}`);
    throw new Error(`Every.org API error: ${response.status}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('cause') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '100000');

    let dbQuery = supabase
      .from('nonprofits_cache')
      .select('*', { count: 'exact' });

    if (category && category !== 'all' && category !== '') {
      dbQuery = dbQuery.eq('category', category);
    }

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const { data, error, count } = await dbQuery
      .order('name')
      .range(from, to);

    if (error) {
      console.error('[Nonprofits API] Database error:', error);
    }

    const nonprofits = (data || []).map(item => ({
      nonprofitSlug: item.nonprofit_slug,
      name: item.name,
      description: item.description,
      logoUrl: item.logo_url,
      coverImageUrl: item.cover_image_url,
      websiteUrl: item.website_url,
      ein: item.ein,
      primarySlug: item.primary_slug,
      locationAddress: item.location_address,
      category: item.category,
    }));

    // If cache is empty and no specific query, try live API as fallback
    if (nonprofits.length === 0 && !query && !error) {
      console.log('[Nonprofits API] Cache is empty, attempting live API fallback...');

      try {
        // Get API key from settings
        const supabaseServiceUrl = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
        const serviceSupabase = createClient(supabaseServiceUrl, supabaseServiceKey);

        const { data: settingsData } = await serviceSupabase
          .from('app_settings')
          .select('value')
          .eq('key', 'every_org_api_key')
          .maybeSingle();

        if (settingsData?.value) {
          const apiKey = settingsData.value;
          const apiCategory = category || 'humans';

          console.log(`[Nonprofits API] Fetching from live API: ${apiCategory}`);

          const liveData = await fetchFromEveryOrgLive(apiCategory, apiKey, 1, Math.min(perPage, 100));

          if (liveData.nonprofits && liveData.nonprofits.length > 0) {
            console.log(`[Nonprofits API] Live API returned ${liveData.nonprofits.length} nonprofits`);

            return NextResponse.json({
              nonprofits: liveData.nonprofits,
              total: liveData.pagination?.total_results || liveData.nonprofits.length,
              page: 1,
              perPage,
              fromCache: false,
              liveApi: true,
              message: 'Data loaded from live API. Run sync to improve performance.',
            });
          }
        } else {
          console.log('[Nonprofits API] No API key configured for live fallback');
        }
      } catch (liveApiError: any) {
        console.error('[Nonprofits API] Live API fallback failed:', liveApiError.message);
        // Continue to return empty cache data with helpful message
      }
    }

    return NextResponse.json({
      nonprofits,
      total: count || 0,
      page,
      perPage,
      fromCache: true,
      cacheEmpty: nonprofits.length === 0,
      message: nonprofits.length === 0 ? 'No data in cache. Please run sync from admin dashboard.' : undefined,
    });

  } catch (error: any) {
    console.error('[Nonprofits API] Fatal error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch nonprofits',
        nonprofits: [],
        suggestion: 'Please check database configuration and run sync from admin dashboard',
      },
      { status: 200 }
    );
  }
}
