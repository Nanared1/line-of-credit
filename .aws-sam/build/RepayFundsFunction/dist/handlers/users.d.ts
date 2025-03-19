import { APIGatewayProxyEvent } from 'aws-lambda';
export declare const createUser: (event: APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const getUser: (event: APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
export declare const updateUser: (event: APIGatewayProxyEvent) => Promise<import("aws-lambda").APIGatewayProxyResult>;
