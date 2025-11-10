export type ReloadlyProduct = {
  productId: number;
  productName: string;
  countryCode: string;
  denominationType: 'FIXED' | 'RANGE';
  recipientCurrencyCode: string;
  minRecipientDenomination: number | null;
  maxRecipientDenomination: number | null;
  senderCurrencyCode: string;
  minSenderDenomination: number | null;
  maxSenderDenomination: number | null;
  fixedRecipientDenominations: number[];
  fixedSenderDenominations: number[];
  logoUrls: string[];
  brand: {
    brandId: number;
    brandName: string;
  };
  redeemInstruction?: {
    concise: string;
    verbose: string;
  };
};

export type ReloadlyOrder = {
  transactionId: number;
  amount: number;
  discount: number;
  currencyCode: string;
  fee: number;
  recipientEmail: string;
  customIdentifier: string;
  status: string;
  product: {
    productId: number;
    productName: string;
    countryCode: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  };
};

class ReloadlyService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.baseUrl = 'https://giftcards.reloadly.com';
  }

  private async getCredentials() {
    const { getSettingServer } = await import('./supabase-server');
    const clientId = await getSettingServer('reloadly_client_id');
    const clientSecret = await getSettingServer('reloadly_client_secret');

    if (!clientId || !clientSecret) {
      throw new Error('Gift card provider credentials not configured. Please set them in the admin dashboard.');
    }

    return { clientId, clientSecret };
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const { clientId, clientSecret } = await this.getCredentials();

    const response = await fetch('https://auth.reloadly.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        audience: 'https://giftcards.reloadly.com',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gift card provider auth error:', errorText);
      throw new Error(`Failed to authenticate with gift card provider: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;

    return this.accessToken!;
  }

  async getProducts(page = 1, size = 20): Promise<{ content: ReloadlyProduct[]; totalElements: number; totalPages: number }> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/products?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/com.reloadly.giftcards-v1+json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gift card API error:', response.status);
        throw new Error(`Failed to fetch gift cards: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      console.error('Gift card fetch error:', error.message);
      throw error;
    }
  }

  async getAllProducts(): Promise<ReloadlyProduct[]> {
    const allProducts: ReloadlyProduct[] = [];
    let page = 1;
    const pageSize = 200;

    try {
      const firstPage = await this.getProducts(page, pageSize);
      allProducts.push(...firstPage.content);

      const totalPages = firstPage.totalPages || Math.ceil(firstPage.totalElements / pageSize);

      for (page = 2; page <= Math.min(totalPages, 50); page++) {
        const pageData = await this.getProducts(page, pageSize);
        allProducts.push(...pageData.content);

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return allProducts;
    } catch (error: any) {
      console.error('Failed to fetch all products:', error.message);
      throw error;
    }
  }

  async getProductById(productId: number): Promise<ReloadlyProduct> {
    const token = await this.getAccessToken();

    // Validate productId to prevent injection
    if (!Number.isInteger(productId) || productId <= 0) {
      throw new Error('Invalid product ID');
    }

    const response = await fetch(`${this.baseUrl}/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.giftcards-v1+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product details');
    }

    return response.json();
  }

  async placeOrder(
    productId: number,
    quantity: number,
    unitPrice: number,
    recipientEmail: string,
    customIdentifier: string
  ): Promise<ReloadlyOrder> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/com.reloadly.giftcards-v1+json',
      },
      body: JSON.stringify({
        productId,
        quantity,
        unitPrice,
        recipientEmail,
        customIdentifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to place order');
    }

    return response.json();
  }

  async getOrderById(transactionId: number): Promise<ReloadlyOrder> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/orders/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.giftcards-v1+json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order details');
    }

    return response.json();
  }

  async calculatePricing(costPrice: number, faceValue: number) {
    const { getSettingServer } = await import('./supabase-server');

    const markupStr = await getSettingServer('markup_percentage') || '5';
    const companySplitStr = await getSettingServer('profit_split_company') || '50';
    const charitySplitStr = await getSettingServer('profit_split_charity') || '50';
    const ticketsMultiplierStr = await getSettingServer('impact_tickets_multiplier') || '10';

    const markup = parseFloat(markupStr) / 100;
    const companySplit = parseFloat(companySplitStr) / 100;
    const charitySplit = parseFloat(charitySplitStr) / 100;
    const ticketsMultiplier = parseFloat(ticketsMultiplierStr);

    const purchasePrice = costPrice * (1 + markup);
    const profit = purchasePrice - costPrice;
    const companyShare = profit * companySplit;
    const charityShare = profit * charitySplit;
    const impactTickets = Math.floor(charityShare * ticketsMultiplier);

    return {
      purchasePrice: Number(purchasePrice.toFixed(2)),
      profit: Number(profit.toFixed(2)),
      companyShare: Number(companyShare.toFixed(2)),
      charityShare: Number(charityShare.toFixed(2)),
      impactTickets,
    };
  }
}

export const reloadlyService = new ReloadlyService();
