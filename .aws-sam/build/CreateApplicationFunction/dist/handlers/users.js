"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUser = exports.createUser = void 0;
const db_1 = require("../utils/db");
const index_1 = require("../models/index");
const errorHandler_1 = require("../utils/errorHandler");
// Create user
const createUserHandler = async (event) => {
    console.log('Creating user with event:', JSON.stringify(event, null, 2));
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const body = JSON.parse(event.body || '{}');
    console.log('Request body:', JSON.stringify(body, null, 2));
    try {
        const user = await index_1.User.create(body);
        console.log('User created successfully:', JSON.stringify(user, null, 2));
        return (0, errorHandler_1.createResponse)(201, user);
    }
    catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};
// Get user
const getUserHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const userId = event.pathParameters?.userId;
    if (!userId) {
        return (0, errorHandler_1.createResponse)(400, { message: 'User ID is required' });
    }
    const user = await index_1.User.findById(userId);
    if (!user) {
        return (0, errorHandler_1.createResponse)(404, { message: 'User not found' });
    }
    return (0, errorHandler_1.createResponse)(200, user);
};
// Update user
const updateUserHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const userId = event.pathParameters?.userId;
    const body = JSON.parse(event.body || '{}');
    if (!userId) {
        return (0, errorHandler_1.createResponse)(400, { message: 'User ID is required' });
    }
    const user = await index_1.User.findByIdAndUpdate(userId, { $set: body }, { new: true });
    if (!user) {
        return (0, errorHandler_1.createResponse)(404, { message: 'User not found' });
    }
    return (0, errorHandler_1.createResponse)(200, user);
};
// Export wrapped handlers
exports.createUser = (0, errorHandler_1.withErrorHandler)(createUserHandler);
exports.getUser = (0, errorHandler_1.withErrorHandler)(getUserHandler);
exports.updateUser = (0, errorHandler_1.withErrorHandler)(updateUserHandler);
//# sourceMappingURL=users.js.map