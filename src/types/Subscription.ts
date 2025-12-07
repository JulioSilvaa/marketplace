export enum SubscriptionStatus {
  TRIAL = "trial",
  ACTIVE = "active",
  CANCELLED = "cancelled",
  SUSPENDED = "suspended",
}

export type ISubscription = {
  id?: string;
  user_id: string;
  plan: string; // VARCHAR(50) NOT NULL DEFAULT 'basic'
  price: number; // NUMERIC(10,2) NOT NULL DEFAULT 30.00
  status?: SubscriptionStatus; // VARCHAR(20) DEFAULT 'trial'
  trial_until?: Date; // trial_ate DATE
  next_billing_date?: Date; // next_winning DATE
  created_at?: Date; // criado_em TIMESTAMPTZ DEFAULT NOW()
  updated_at?: Date; // updated_in TIMESTAMPTZ DEFAULT NOW()
};
