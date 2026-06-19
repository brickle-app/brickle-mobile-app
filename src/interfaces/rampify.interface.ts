export interface User {
  email: string;
  phone: string;
}

export interface RampifyCustomer {
  customerId: string;
  createdAt: string;
}

export interface RampifyQuote {
  quoteId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: string;
  toAmount: string;
  paymentMethodType: string;
  rate: string;
  fees: {
    type: string;
    amount: string;
    currency: string;
  }[];
  chain: string;
  expiration: string;
  metadata: null;
}

export interface RampifyAssetPurchase {
  id: string;
  transaction: unknown;
  fiatPaymentInstructions: null;
  checkoutUrl: string;
  expirationDate: string;
  buyResponse: {
    checkoutUrl: string;
  };
}

export interface RampifyKYC {
  kycSubmission: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    countryOfResidence: string;
    nationality: string;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  code: string;
  icon?: string;
  regions: string[];
}
