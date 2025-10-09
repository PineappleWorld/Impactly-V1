type EveryOrgNonprofit = {
  nonprofitSlug: string;
  name: string;
  description: string;
  logoUrl: string;
  coverImageUrl: string;
  websiteUrl: string;
  ein: string;
  primarySlug: string;
  locationAddress: string;
  category: string;
};

type EveryOrgSearchResponse = {
  nonprofits: EveryOrgNonprofit[];
  pagination?: {
    page: number;
    pages: number;
    page_size: number;
    total_results: number;
  };
};

class EveryOrgService {
  private baseUrl = 'https://partners.every.org/v0.2';

  private async getApiKey(): Promise<string> {
    const { getSettingServer } = await import('./supabase-server');
    const apiKey = await getSettingServer('every_org_api_key');

    if (!apiKey) {
      throw new Error('Every.org API key not configured. Please set it in the admin dashboard.');
    }

    return apiKey;
  }

  async searchNonprofits(query: string = '', page: number = 1, perPage: number = 20): Promise<EveryOrgSearchResponse> {
    try {
      const apiKey = await this.getApiKey();

      const url = new URL(`${this.baseUrl}/search/${encodeURIComponent(query)}`);
      url.searchParams.append('apiKey', apiKey);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('take', perPage.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Every.org API error:', response.status);
        throw new Error(`Failed to fetch nonprofits: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('Every.org search error:', error.message);
      throw error;
    }
  }

  async getNonprofitBySlug(slug: string): Promise<EveryOrgNonprofit> {
    try {
      const apiKey = await this.getApiKey();

      const url = new URL(`${this.baseUrl}/nonprofit/${slug}`);
      url.searchParams.append('apiKey', apiKey);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Every.org nonprofit API error:', response.status);
        throw new Error(`Failed to fetch nonprofit: ${response.status}`);
      }

      const data = await response.json();
      return data.nonprofit;
    } catch (error: any) {
      console.error('Every.org getNonprofit error:', error.message);
      throw error;
    }
  }

  async getBrowseNonprofits(cause: string = 'humans', page: number = 1, perPage: number = 100): Promise<EveryOrgSearchResponse> {
    try {
      const apiKey = await this.getApiKey();

      const url = new URL(`${this.baseUrl}/browse/${cause}`);
      url.searchParams.append('apiKey', apiKey);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('take', perPage.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Every.org browse API error:', response.status);
        throw new Error(`Failed to browse nonprofits: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('Every.org browse error:', error.message);
      throw error;
    }
  }

  async getAllNonprofits(cause: string = 'humans'): Promise<EveryOrgNonprofit[]> {
    const allNonprofits: EveryOrgNonprofit[] = [];
    let page = 1;
    const pageSize = 100;
    let requestCount = 0;
    const startTime = Date.now();

    try {
      console.log(`🔍 Starting to fetch ALL nonprofits for cause: ${cause}`);
      const firstPage = await this.getBrowseNonprofits(cause, page, pageSize);
      allNonprofits.push(...firstPage.nonprofits);
      requestCount++;

      if (firstPage.pagination) {
        const totalPages = firstPage.pagination.pages;
        const totalResults = firstPage.pagination.total_results;
        console.log(`📊 Total pages to fetch: ${totalPages} (${totalResults} organizations) for ${cause}`);

        for (page = 2; page <= totalPages; page++) {
          if (requestCount >= 450) {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < 60000) {
              const waitTime = 60000 - elapsedTime + 1000;
              console.log(`⏳ Rate limit approaching. Waiting ${Math.round(waitTime/1000)}s...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              requestCount = 0;
            }
          }

          const pageData = await this.getBrowseNonprofits(cause, page, pageSize);
          allNonprofits.push(...pageData.nonprofits);
          requestCount++;

          if (page % 50 === 0) {
            console.log(`📈 Progress: ${page}/${totalPages} pages (${allNonprofits.length}/${totalResults} orgs) - ${cause}`);
          }

          await new Promise(resolve => setTimeout(resolve, 130));
        }
      }

      console.log(`✅ Successfully fetched ALL ${allNonprofits.length} nonprofits for cause: ${cause}`);
      return allNonprofits;
    } catch (error: any) {
      console.error(`❌ Failed to fetch nonprofits for ${cause}:`, error.message);
      console.log(`⚠️ Partial results: ${allNonprofits.length} nonprofits fetched before error`);
      return allNonprofits;
    }
  }
}

export const everyOrgService = new EveryOrgService();
export type { EveryOrgNonprofit, EveryOrgSearchResponse };
