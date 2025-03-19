"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withErrorHandler = exports.createResponse = void 0;
const createResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
});
exports.createResponse = createResponse;
const withErrorHandler = (handler) => async (event) => {
    try {
        return await handler(event);
    }
    catch (error) {
        console.error('Error details:', {
            name: error?.name || 'Unknown error',
            message: error?.message || 'No error message',
            stack: error?.stack || 'No stack trace',
            error: error ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : 'Error object is null'
        });
        return (0, exports.createResponse)(500, {
            message: 'Internal server error',
            details: error?.message || 'Unknown error'
        });
    }
};
exports.withErrorHandler = withErrorHandler;
//# sourceMappingURL=errorHandler.js.map