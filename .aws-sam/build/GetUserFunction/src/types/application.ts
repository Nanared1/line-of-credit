import { Types } from 'mongoose';

export enum ApplicationStatus {
  OPEN = 'Open',
  PROCESSING = 'Processing',
  CANCELLED = 'Cancelled',
  REJECTED = 'Rejected',
  OUTSTANDING = 'Outstanding',
  REPAID = 'Repaid'
}

export interface ILineOfCreditApplication {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  status: ApplicationStatus;
  requestedAmount: number;
  disbursedAmount: number;
  expressDelivery: boolean;
  tip: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateApplicationRequest {
  userId: string;
  requestedAmount: number;
  expressDelivery?: boolean;
  tip?: number;
}

export interface IDisburseFundsRequest {
  applicationId: string;
  amount: number;
  expressDelivery?: boolean;
  tip?: number;
}

export interface IRepayRequest {
  applicationId: string;
  amount: number;
}

export interface IRejectApplicationRequest {
  applicationId: string;
  adminId: string;
} 