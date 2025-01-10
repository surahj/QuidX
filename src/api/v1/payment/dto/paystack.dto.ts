export type PaystackPayload = {
  email?: string;
  amount: number;
  ref: string;
  redirectUrl?: string;
  currency?: string;
  channels?: string[];
};

export type PaystackResponse = {
  id?: string;
  status: string;
  amount: number;
  message: string;
  fee?: number;
};
