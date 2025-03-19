import { APIGatewayProxyEvent } from 'aws-lambda';
export declare const createApplication: (event: APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const disburseFunds: (event: APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const repayFunds: (event: APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const rejectApplication: (event: APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const getUserApplications: (event: APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
