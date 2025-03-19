import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
export declare const createUser: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export declare const getUser: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export declare const updateUser: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
export declare const getAllUsers: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;
