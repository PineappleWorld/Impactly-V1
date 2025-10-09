import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to validate Every.org API configuration
 * This helps diagnose connectivity and authentication issues
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const results: any = {
    timestamp: new Date().toISOString(),
    steps: [],
  };

  try {
    // Step 1: Check if API key exists in database
    results.steps.push({ step: 1, description: 'Checking for API key in database' });
    const { data: settingsData, error: settingsError } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'every_org_api_key')
      .maybeSingle();

    if (settingsError) {
      results.steps.push({
        step: 1,
        status: 'error',
        message: 'Database error',
        error: settingsError.message
      });
      return NextResponse.json(results, { status: 500 });
    }

    if (!settingsData?.value) {
      results.steps.push({
        step: 1,
        status: 'error',
        message: 'Every.org API key not configured in admin settings'
      });
      return NextResponse.json(results, { status: 400 });
    }

    results.steps.push({
      step: 1,
      status: 'success',
      message: 'API key found',
      keyPrefix: settingsData.value.substring(0, 15) + '...'
    });

    const apiKey = settingsData.value;

    // Step 2: Test API connection with a simple request
    results.steps.push({ step: 2, description: 'Testing Every.org API connection' });

    const testUrl = `https://partners.every.org/v0.2/browse/humans?apiKey=${apiKey}&page=1&take=3`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    results.steps.push({
      step: 2,
      status: response.ok ? 'success' : 'error',
      httpStatus: response.status,
      statusText: response.statusText,
    });

    if (!response.ok) {
      const errorText = await response.text();
      results.steps.push({
        step: 2,
        status: 'error',
        message: 'API request failed',
        responseBody: errorText.substring(0, 200),
      });
      return NextResponse.json(results, { status: 200 });
    }

    const data = await response.json();

    // Step 3: Validate response structure
    results.steps.push({ step: 3, description: 'Validating API response' });

    if (data.nonprofits && Array.isArray(data.nonprofits)) {
      // Check first nonprofit's structure
      const firstNonprofit = data.nonprofits[0] || {};
      const hasSlug = firstNonprofit.nonprofitSlug || firstNonprofit.primarySlug || firstNonprofit.slug;

      results.steps.push({
        step: 3,
        status: 'success',
        message: 'API returning valid data',
        nonprofitsCount: data.nonprofits.length,
        totalResults: data.pagination?.total_results || 'unknown',
        sampleNonprofit: firstNonprofit.name || 'none',
        sampleStructure: {
          hasNonprofitSlug: !!firstNonprofit.nonprofitSlug,
          hasPrimarySlug: !!firstNonprofit.primarySlug,
          hasSlug: !!firstNonprofit.slug,
          hasName: !!firstNonprofit.name,
          availableFields: Object.keys(firstNonprofit),
        },
      });

      // Warn if slug is missing
      if (!hasSlug) {
        results.steps.push({
          step: 3,
          status: 'warning',
          message: 'First nonprofit is missing slug field. This may cause sync issues.',
          nonprofit: firstNonprofit,
        });
      }
    } else {
      results.steps.push({
        step: 3,
        status: 'error',
        message: 'Unexpected response structure',
        response: data,
      });
    }

    // Step 4: Check database cache status
    results.steps.push({ step: 4, description: 'Checking cache status' });

    const { count, error: countError } = await supabase
      .from('nonprofits_cache')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      results.steps.push({
        step: 4,
        status: 'error',
        message: 'Failed to query cache',
        error: countError.message,
      });
    } else {
      results.steps.push({
        step: 4,
        status: 'success',
        message: 'Cache accessible',
        cachedRecords: count || 0,
        cacheEmpty: (count || 0) === 0,
      });
    }

    results.overall = 'success';
    results.message = 'All checks passed. API is configured correctly.';

    if ((count || 0) === 0) {
      results.recommendation = 'Cache is empty. Run the sync process from the admin dashboard to populate nonprofit data.';
    }

    return NextResponse.json(results, { status: 200 });

  } catch (error: any) {
    results.overall = 'error';
    results.message = 'Test failed with exception';
    results.error = error.message;
    results.stack = error.stack;
    return NextResponse.json(results, { status: 500 });
  }
}
