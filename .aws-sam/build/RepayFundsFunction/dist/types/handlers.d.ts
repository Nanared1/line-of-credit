import { APIGatewayProxyEvent } from 'aws-lambda';
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
    adminId: string;
}
export interface IHandlerEvent<T = any> extends Omit<APIGatewayProxyEvent, 'body'> {
    body: string;
}
export interface IHandlerResponse {
    statusCode: number;
    headers: {
        'Content-Type': string;
        'Access-Control-Allow-Origin': string;
    };
    body: string;
}
export interface IErrorResponse {
    message: string;
}
