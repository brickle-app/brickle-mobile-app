import { PaymentMethodType } from "../constants/payment";

export interface Quote {
  chain: string;
  expiration: string;
  fees: { amount: string; currency: string; type: string }[];
  fromAmount: string;
  fromCurrency: string;
  quoteId: string;
  paymentMethodType: PaymentMethodType;
  rate: string;
  toAmount: string;
  toCurrency: string;
}

export interface Onramp {
  createdAt: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  errorMessage: string | null;
  externalId: string;
  fiatAmount: number;
  fiatCurrency: string;
  id: string;
  metadata: {
    buyResponse: {
      checkoutUrl: string;
      expirationDate: string;
      fiatPaymentInstructions: any;
      transaction: any;
    };
    cancelUrl: string;
    chain: string;
    depositAddress: string;
    deviceId: string;
    paymentMethodType: PaymentMethodType;
    successUrl: string;
  };
  status: string;
  type: string;
  updatedAt: string;
  userId: string;
}
