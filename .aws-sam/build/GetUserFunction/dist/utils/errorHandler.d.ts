import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IHandlerEvent } from '../types/handlers';
type HandlerFunction = (event: IHandlerEvent) => Promise<APIGatewayProxyResult>;
export declare const CORS_HEADERS: {
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Credentials': string;
    'Access-Control-Allow-Methods': string;
    'Access-Control-Allow-Headers': string;
    'Access-Control-Max-Age': string;
};
export declare const createResponse: (statusCode: number, body: unknown) => APIGatewayProxyResult;
export declare const withErrorHandler: (handler: HandlerFunction) => (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export {};
