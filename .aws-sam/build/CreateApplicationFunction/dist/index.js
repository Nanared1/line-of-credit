"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHandler = getHandler;
exports.postHandler = postHandler;
/**
 * GET request handler
 */
async function getHandler(event) {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello from GET Lambda!",
            input: event
        })
    };
}
/**
 * POST request handler
 */
async function postHandler(event) {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "No request body provided" })
        };
    }
    const requestData = JSON.parse(event.body);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Hello from POST Lambda!",
            receivedData: requestData
        })
    };
}
//# sourceMappingURL=index.js.map