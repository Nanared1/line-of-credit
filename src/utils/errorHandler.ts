import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { IHandlerEvent } from '../types/handlers';

type HandlerFunction = (event: IHandlerEvent) => Promise<APIGatewayProxyResult>;

export const createResponse = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(body),
});

export const withErrorHandler = (handler: HandlerFunction) => async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Convert APIGatewayProxyEvent to IHandlerEvent
    const handlerEvent: IHandlerEvent = {
      ...event,
      body: event.body || ''
    };
    return await handler(handlerEvent);
  } catch (error: unknown) {
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown error',
      message: error instanceof Error ? error.message : 'No error message',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      error: error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : 'Error object is null'
    });
    return createResponse(500, { 
      message: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}; 