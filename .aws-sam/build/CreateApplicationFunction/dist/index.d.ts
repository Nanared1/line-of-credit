import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
/**
 * GET request handler
 */
export declare function getHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
/**
 * POST request handler
 */
export declare function postHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
