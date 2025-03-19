"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllClientApplications = exports.getApplicationTransactions = exports.getUserApplications = exports.rejectApplication = exports.repayFunds = exports.disburseFunds = exports.createApplication = void 0;
const db_1 = require("../utils/db");
const index_1 = require("../models/index");
const transaction_1 = require("../types/transaction");
const errorHandler_1 = require("../utils/errorHandler");
const application_1 = require("../types/application");
const EXPRESS_DELIVERY_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
// Create application
const createApplicationHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const body = JSON.parse(event.body);
    const user = await index_1.User.findById(body.userId);
    if (!user) {
        return (0, errorHandler_1.createResponse)(404, { message: 'User not found' });
    }
    if (body.requestedAmount > user.creditLimit) {
        return (0, errorHandler_1.createResponse)(400, { message: 'Requested amount exceeds credit limit' });
    }
    const application = await index_1.LineOfCreditApplication.create({
        userId: body.userId,
        requestedAmount: body.requestedAmount,
        expressDelivery: body.expressDelivery || false,
        tip: body.tip || 0,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    return (0, errorHandler_1.createResponse)(201, application);
};
// Disburse funds
const disburseFundsHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const body = JSON.parse(event.body);
    const result = await (0, db_1.withTransaction)(async (session) => {
        // Find the application with lock
        const application = await index_1.LineOfCreditApplication.findOneAndUpdate({
            _id: body.applicationId,
            status: application_1.ApplicationStatus.OPEN
        }, { $set: { status: application_1.ApplicationStatus.PROCESSING } }, { new: true, session });
        if (!application) {
            throw new Error('Application not found or not in Open state');
        }
        // Check express delivery window
        if (application.expressDelivery) {
            const now = new Date();
            const created = new Date(application.createdAt);
            const timeElapsed = now.getTime() - created.getTime();
            if (timeElapsed > EXPRESS_DELIVERY_WINDOW_MS) {
                application.status = application_1.ApplicationStatus.OPEN;
                await application.save({ session });
                throw new Error('Express delivery window has expired');
            }
        }
        // Find the user
        const user = await index_1.User.findById(application.userId);
        if (!user) {
            throw new Error('User not found');
        }
        const totalAmount = body.amount + (body.tip || 0);
        if (application.disbursedAmount + totalAmount > user.creditLimit) {
            application.status = application_1.ApplicationStatus.OPEN;
            await application.save({ session });
            throw new Error('Disbursement would exceed credit limit');
        }
        // Create transaction record
        await index_1.Transaction.create([{
                applicationId: application._id,
                type: transaction_1.TransactionType.DISBURSEMENT,
                amount: totalAmount,
                createdAt: new Date()
            }], { session });
        // Update application
        application.disbursedAmount += totalAmount;
        application.status = application_1.ApplicationStatus.OUTSTANDING;
        application.expressDelivery = body.expressDelivery || false;
        application.tip = (application.tip || 0) + (body.tip || 0);
        application.updatedAt = new Date();
        await application.save({ session });
        return application;
    });
    return (0, errorHandler_1.createResponse)(200, result);
};
// Repay funds
const repayFundsHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const body = JSON.parse(event.body);
    const result = await (0, db_1.withTransaction)(async (session) => {
        // Find the application with lock
        const application = await index_1.LineOfCreditApplication.findOneAndUpdate({
            _id: body.applicationId,
            status: application_1.ApplicationStatus.OUTSTANDING
        }, { $set: { status: application_1.ApplicationStatus.PROCESSING } }, { new: true, session });
        if (!application) {
            throw new Error('Application not found or not in Outstanding state');
        }
        if (body.amount <= 0) {
            application.status = application_1.ApplicationStatus.OUTSTANDING;
            await application.save({ session });
            throw new Error('Repayment amount must be greater than 0');
        }
        if (body.amount > application.disbursedAmount) {
            application.status = application_1.ApplicationStatus.OUTSTANDING;
            await application.save({ session });
            throw new Error('Repayment amount exceeds disbursed amount');
        }
        // Create transaction record
        await index_1.Transaction.create([{
                applicationId: application._id,
                type: transaction_1.TransactionType.REPAYMENT,
                amount: body.amount,
                createdAt: new Date()
            }], { session });
        // Update application
        application.disbursedAmount -= body.amount;
        application.status = application.disbursedAmount === 0
            ? application_1.ApplicationStatus.REPAID
            : application_1.ApplicationStatus.OUTSTANDING;
        application.updatedAt = new Date();
        await application.save({ session });
        return application;
    });
    return (0, errorHandler_1.createResponse)(200, result);
};
// Reject application
const rejectApplicationHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const body = JSON.parse(event.body);
    // // Verify admin token
    // const adminToken = event.headers['x-admin-token'];
    // if (!adminToken) {
    //   return createResponse(401, { message: 'Unauthorized: Admin access required' });
    // }
    const result = await (0, db_1.withTransaction)(async (session) => {
        const application = await index_1.LineOfCreditApplication.findOneAndUpdate({
            _id: body.applicationId,
            status: application_1.ApplicationStatus.OPEN
        }, {
            $set: {
                status: application_1.ApplicationStatus.REJECTED,
                updatedAt: new Date()
            }
        }, { new: true, session });
        if (!application) {
            throw new Error('Application not found or not in Open state');
        }
        return application;
    });
    return (0, errorHandler_1.createResponse)(200, result);
};
// Get user's applications
const getUserApplicationsHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const userId = event.pathParameters?.userId;
    if (!userId) {
        return (0, errorHandler_1.createResponse)(400, { message: 'User ID is required' });
    }
    const applications = await index_1.LineOfCreditApplication.find({ userId })
        .sort({ createdAt: -1 });
    return (0, errorHandler_1.createResponse)(200, applications);
};
// Get application transactions
const getApplicationTransactionsHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const applicationId = event.pathParameters?.applicationId;
    if (!applicationId) {
        return (0, errorHandler_1.createResponse)(400, { message: 'Application ID is required' });
    }
    const transactions = await index_1.Transaction.find({ applicationId })
        .sort({ createdAt: -1 });
    return (0, errorHandler_1.createResponse)(200, transactions);
};
// Get all applications (admin only)
const getAllApplicationsHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    console.log('Starting getAllApplicationsHandler', event.body);
    const applications = await index_1.LineOfCreditApplication.find().sort({ createdAt: -1 });
    return (0, errorHandler_1.createResponse)(200, applications);
};
// Export all handlers
exports.createApplication = (0, errorHandler_1.withErrorHandler)(createApplicationHandler);
exports.disburseFunds = (0, errorHandler_1.withErrorHandler)(disburseFundsHandler);
exports.repayFunds = (0, errorHandler_1.withErrorHandler)(repayFundsHandler);
exports.rejectApplication = (0, errorHandler_1.withErrorHandler)(rejectApplicationHandler);
exports.getUserApplications = (0, errorHandler_1.withErrorHandler)(getUserApplicationsHandler);
exports.getApplicationTransactions = (0, errorHandler_1.withErrorHandler)(getApplicationTransactionsHandler);
exports.getAllClientApplications = (0, errorHandler_1.withErrorHandler)(getAllApplicationsHandler);
//# sourceMappingURL=applications.js.map