export interface ISubscription {
  id: number;
  userId: number;
  tierId: number;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  status: 'active' | 'expired' | 'cancelled';
  paymentReference?: string;
}

export interface ISubscriptionTier {
  id: number;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
}

export interface IGroupSubscription {
  id: number;
  parentSubscriptionId: number;
  memberIds: number[];
}
