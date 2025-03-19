import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
export declare const createResponse: (statusCode: number, body: any) => APIGatewayProxyResult;
export declare const withErrorHandler: (handler: Function) => (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
