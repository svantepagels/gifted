import type {
  AuthResponse,
  Product,
  OrderRequest,
  OrderResponse,
  RedeemInstructionsResponse,
  PaginatedResponse,
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
   * Note: This returns PAGINATED results. Use getAllProductsPaginated() for pagination support.
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

    const data = await response.json();
    
    // Handle paginated response - return first page content
    return Array.isArray(data) ? data : (data.content || []);
  }

  /**
   * Get products with pagination support
   * 
   * @param page Page number (0-indexed)
   * @param size Page size (max 200)
   * @returns Array of products for the requested page
   */
  async getAllProductsPaginated(page: number = 0, size: number = 200): Promise<Product[]> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/products?page=${page}&size=${Math.min(size, 200)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch products page ${page}: ${error}`);
    }

    const data = await response.json();
    
    // Return products from paginated response
    return data.content || [];
  }

  /**
   * Get products with pagination support AND metadata
   * Returns full response structure to check pagination state
   * 
   * @param page Page number (0-indexed)
   * @param size Page size (max 200)
   * @returns Paginated response with products and metadata
   */
  async getAllProductsPaginatedWithMeta(
    page: number = 0,
    size: number = 200
  ): Promise<PaginatedResponse<Product>> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/products?page=${page}&size=${Math.min(size, 200)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch products page ${page}: ${error}`);
    }

    const data = await response.json();
    
    // Return full response with metadata
    return {
      content: data.content || [],
      pageable: data.pageable || { pageNumber: page, pageSize: size },
      totalElements: data.totalElements || 0,
      totalPages: data.totalPages || 1,
      last: data.last ?? true,
      first: data.first ?? (page === 0),
    };
  }

  /**
   * Get ALL products across all pages (use with caution - can be slow)
   * Fetches all pages sequentially until no more results
   * 
   * @returns Complete array of all products
   */
  async getAllProductsComplete(): Promise<Product[]> {
    let allProducts: Product[] = [];
    let page = 0;
    let hasMore = true;
    const maxPages = 50; // Safety limit
    
    while (hasMore && page < maxPages) {
      const products = await this.getAllProductsPaginated(page, 200);
      allProducts = allProducts.concat(products);
      hasMore = products.length === 200;
      page++;
    }
    
    return allProducts;
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
