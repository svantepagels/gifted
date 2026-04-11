import type {
  AuthResponse,
  Product,
  OrderRequest,
  OrderResponse,
  RedeemInstructionsResponse,
} from './types';

export class ReloadlyClient {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly environment: 'sandbox' | 'production';
  private readonly authUrl: string;
  private readonly baseUrl: string;

  constructor() {
    this.clientId = process.env.RELOADLY_CLIENT_ID || '';
    this.clientSecret = process.env.RELOADLY_CLIENT_SECRET || '';
    this.environment = (process.env.RELOADLY_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    this.authUrl = process.env.RELOADLY_AUTH_URL || 'https://auth.reloadly.com';
    
    this.baseUrl =
      this.environment === 'production'
        ? process.env.RELOADLY_GIFTCARDS_PRODUCTION_URL || 'https://giftcards.reloadly.com'
        : process.env.RELOADLY_GIFTCARDS_SANDBOX_URL || 'https://giftcards-sandbox.reloadly.com';

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Reloadly credentials not configured. Check .env.local');
    }
  }

  /**
   * Authenticate with Reloadly and get access token
   */
  private async authenticate(): Promise<string> {
    const response = await fetch(`${this.authUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
        audience: this.baseUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Reloadly authentication failed: ${error}`);
    }

    const data: AuthResponse = await response.json();
    this.accessToken = data.access_token;
    // Set expiry time (current time + expires_in - 60 second buffer)
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

    return data.access_token;
  }

  /**
   * Get valid access token (refresh if needed)
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    return await this.authenticate();
  }

  /**
   * Get all products available in a specific country
   */
  async getProducts(countryCode: string): Promise<Product[]> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/countries/${countryCode}/products`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch products: ${error}`);
    }

    return await response.json();
  }

  /**
   * Get all products globally (across all countries)
   */
  async getAllProducts(): Promise<Product[]> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch all products: ${error}`);
    }

    return await response.json();
  }

  /**
   * Place a gift card order
   */
  async placeOrder(orderData: OrderRequest): Promise<OrderResponse> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/com.reloadly.giftcards-v1+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to place order: ${error}`);
    }

    return await response.json();
  }

  /**
   * Get redeem instructions for a specific brand
   */
  async getRedeemInstructions(brandId: number): Promise<RedeemInstructionsResponse> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/redeem-instructions/${brandId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch redeem instructions: ${error}`);
    }

    return await response.json();
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: number): Promise<Product> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/products/${productId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch product: ${error}`);
    }

    return await response.json();
  }
}

// Export singleton instance
export const reloadlyClient = new ReloadlyClient();
