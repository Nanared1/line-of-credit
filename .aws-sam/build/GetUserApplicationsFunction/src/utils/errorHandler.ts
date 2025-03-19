import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const createResponse = (statusCode: number, body: any): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(body),
});

export const withErrorHandler = (handler: Function) => async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    return await handler(event);
  } catch (error: any) {
    console.error('Error details:', {
      name: error?.name || 'Unknown error',
      message: error?.message || 'No error message',
      stack: error?.stack || 'No stack trace',
      error: error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : 'Error object is null'
    });
    return createResponse(500, { 
      message: 'Internal server error', 
      details: error?.message || 'Unknown error' 
    });
  }
}; 