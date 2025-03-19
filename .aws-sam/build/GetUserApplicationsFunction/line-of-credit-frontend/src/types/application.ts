export enum ApplicationStatus {
  OPEN = 'Open',
  CANCELLED = 'Cancelled',
  REJECTED = 'Rejected',
  OUTSTANDING = 'Outstanding',
  REPAID = 'Repaid'
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  creditLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  _id: string;
  applicationId: string;
  type: 'DISBURSEMENT' | 'REPAYMENT';
  amount: number;
  createdAt: Date;
}

export interface Application {
  _id: string;
  userId: string;
  status: ApplicationStatus;
  requestedAmount: number;
  disbursedAmount: number;
  expressDelivery: boolean;
  tip: number;
  createdAt: Date;
  updatedAt: Date;
} 