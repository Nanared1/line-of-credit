"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.updateUser = exports.getUser = exports.createUser = void 0;
const db_1 = require("../utils/db");
const user_model_1 = require("../models/user.model");
const errorHandler_1 = require("../utils/errorHandler");
// Create user
const createUserHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const body = JSON.parse(event.body);
    const user = await user_model_1.User.create(body);
    return (0, errorHandler_1.createResponse)(201, user);
};
// Get user
const getUserHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const userId = event.pathParameters?.userId;
    if (!userId) {
        return (0, errorHandler_1.createResponse)(400, { message: 'User ID is required' });
    }
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        return (0, errorHandler_1.createResponse)(404, { message: 'User not found' });
    }
    return (0, errorHandler_1.createResponse)(200, user);
};
// Update user
const updateUserHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const userId = event.pathParameters?.userId;
    const body = JSON.parse(event.body);
    if (!userId) {
        return (0, errorHandler_1.createResponse)(400, { message: 'User ID is required' });
    }
    const user = await user_model_1.User.findByIdAndUpdate(userId, { $set: body }, { new: true });
    if (!user) {
        return (0, errorHandler_1.createResponse)(404, { message: 'User not found' });
    }
    return (0, errorHandler_1.createResponse)(200, user);
};
// Get all users (admin only)
const getAllUsersHandler = async (event) => {
    try {
        // const adminToken = event.headers['X-Admin-Token'];
        // console.log('Admin token present:', !!adminToken);
        // if (!adminToken) {
        //   console.log('No admin token provided');
        //   return createResponse(401, { message: 'Admin token is required' });
        // }
        try {
            await (0, db_1.connectDB)(process.env.MONGODB_URI);
            console.log('Successfully connected to MongoDB');
        }
        catch (dbError) {
            console.error('MongoDB connection error:', dbError);
            return (0, errorHandler_1.createResponse)(500, {
                message: 'Failed to connect to database',
                error: dbError.message
            });
        }
        console.log('Fetching users...');
        const users = await user_model_1.User.find().sort({ createdAt: -1 });
        console.log(`Successfully found ${users.length} users`);
        return (0, errorHandler_1.createResponse)(200, users);
    }
    catch (error) {
        console.error('Error in getAllUsersHandler:', error);
        console.error('Error stack:', error.stack);
        return (0, errorHandler_1.createResponse)(500, {
            message: 'Internal server error',
            error: error.message,
            stack: error.stack
        });
    }
};
// Export wrapped handlers
exports.createUser = (0, errorHandler_1.withErrorHandler)(createUserHandler);
exports.getUser = (0, errorHandler_1.withErrorHandler)(getUserHandler);
exports.updateUser = (0, errorHandler_1.withErrorHandler)(updateUserHandler);
exports.getAllUsers = (0, errorHandler_1.withErrorHandler)(getAllUsersHandler);
//# sourceMappingURL=users.js.map