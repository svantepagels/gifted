export interface AuthResponse {
  access_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

export interface Brand {
  brandId: number;
  brandName: string;
}

export interface Country {
  isoName: string;
  name: string;
  flagUrl: string;
}

export interface RedeemInstruction {
  concise: string;
  verbose: string;
}

export interface Product {
  productId: number;
  productName: string;
  global: boolean;
  senderFee: number;
  discountPercentage: number;
  denominationType: 'FIXED' | 'RANGE';
  recipientCurrencyCode: string;
  minRecipientDenomination: number | null;
  maxRecipientDenomination: number | null;
  senderCurrencyCode: string;
  minSenderDenomination: number | null;
  maxSenderDenomination: number | null;
  fixedRecipientDenominations: number[];
  fixedSenderDenominations: number[];
  fixedRecipientToSenderDenominationsMap: Record<string, number>;
  logoUrls: string[];
  brand: Brand;
  country: Country;
  redeemInstruction: RedeemInstruction;
}

export interface OrderRequest {
  productId: number;
  countryCode: string;
  quantity: number;
  unitPrice: number;
  customIdentifier: string;
  senderName: string;
  recipientEmail: string;
  recipientPhoneDetails?: {
    countryCode: string;
    phoneNumber: string;
  };
}

export interface OrderProduct {
  productId: number;
  productName: string;
  countryCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currencyCode: string;
  brand: Brand;
}

export interface OrderResponse {
  transactionId: number;
  amount: number;
  discount: number;
  currencyCode: string;
  fee: number;
  smsFee: number;
  recipientEmail: string;
  recipientPhone: string;
  customIdentifier: string;
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED';
  transactionCreatedTime: string;
  product: OrderProduct;
}

export interface RedeemInstructionsResponse {
  brandId: number;
  brandName: string;
  concise: string;
  verbose: string;
}
