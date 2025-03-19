"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withErrorHandler = exports.createResponse = exports.CORS_HEADERS = void 0;
exports.CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Admin-Token',
    'Access-Control-Max-Age': '300'
};
const createResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        ...exports.CORS_HEADERS
    },
    body: JSON.stringify(body),
});
exports.createResponse = createResponse;
const withErrorHandler = (handler) => async (event) => {
    try {
        // Convert APIGatewayProxyEvent to IHandlerEvent
        const handlerEvent = {
            ...event,
            body: event.body || ''
        };
        return await handler(handlerEvent);
    }
    catch (error) {
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown error',
            message: error instanceof Error ? error.message : 'No error message',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            error: error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : 'Error object is null'
        });
        return (0, exports.createResponse)(500, {
            message: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.withErrorHandler = withErrorHandler;
//# sourceMappingURL=errorHandler.js.map