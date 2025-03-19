import { APIGatewayProxyEvent } from 'aws-lambda';
import { IUser } from './user';
import { ApplicationStatus } from './application';
import { TransactionType } from './transaction';

// User Handler Inputs
export interface ICreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  creditLimit: number;
}

export interface IUpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  creditLimit?: number;
}

// Application Handler Inputs
export interface ICreateApplicationInput {
  userId: string;
  requestedAmount: number;
  expressDelivery?: boolean;
  tip?: number;
}

export interface IDisburseFundsInput {
  applicationId: string;
  amount: number;
  expressDelivery?: boolean;
  tip?: number;
}

export interface IRepayFundsInput {
  applicationId: string;
  amount: number;
}

export interface IRejectApplicationInput {
  applicationId: string;
}

// Handler Event Types
export interface IHandlerEvent<T = any> extends Omit<APIGatewayProxyEvent, 'body'> {
  body: string;
}

// Response Types
export interface IHandlerResponse {
  statusCode: number;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
  };
  body: string;
}

// Error Response Type
export interface IErrorResponse {
  message: string;
} 