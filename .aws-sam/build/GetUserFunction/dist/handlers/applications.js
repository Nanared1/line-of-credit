"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserApplications = exports.rejectApplication = exports.repayFunds = exports.disburseFunds = exports.createApplication = void 0;
const db_1 = require("../utils/db");
const index_1 = require("../models/index");
const index_2 = require("../types/index");
const transaction_1 = require("../types/transaction");
const errorHandler_1 = require("../utils/errorHandler");
// Create application
const createApplicationHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const body = JSON.parse(event.body || '{}');
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
    });
    return (0, errorHandler_1.createResponse)(201, application);
};
// Disburse funds
const disburseFundsHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const body = JSON.parse(event.body || '{}');
    const application = await index_1.LineOfCreditApplication.findById(body.applicationId);
    if (!application) {
        return (0, errorHandler_1.createResponse)(404, { message: 'Application not found' });
    }
    if (application.status !== index_2.ApplicationStatus.OPEN) {
        return (0, errorHandler_1.createResponse)(400, { message: 'Application is not in Open state' });
    }
    const user = await index_1.User.findById(application.userId);
    if (!user) {
        return (0, errorHandler_1.createResponse)(404, { message: 'User not found' });
    }
    const totalAmount = body.amount + (body.tip || 0);
    if (application.disbursedAmount + totalAmount > user.creditLimit) {
        return (0, errorHandler_1.createResponse)(400, { message: 'Disbursement would exceed credit limit' });
    }
    // Create transaction
    await index_1.Transaction.create({
        applicationId: application._id,
        type: transaction_1.TransactionType.DISBURSEMENT,
        amount: totalAmount,
    });
    // Update application
    application.disbursedAmount += totalAmount;
    application.status = index_2.ApplicationStatus.OUTSTANDING;
    application.expressDelivery = body.expressDelivery || false;
    application.tip = (application.tip || 0) + (body.tip || 0);
    await application.save();
    return (0, errorHandler_1.createResponse)(200, application);
};
// Repay funds
const repayFundsHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const body = JSON.parse(event.body || '{}');
    const application = await index_1.LineOfCreditApplication.findById(body.applicationId);
    if (!application) {
        return (0, errorHandler_1.createResponse)(404, { message: 'Application not found' });
    }
    if (application.status !== index_2.ApplicationStatus.OUTSTANDING) {
        return (0, errorHandler_1.createResponse)(400, { message: 'Application is not in Outstanding state' });
    }
    if (body.amount > application.disbursedAmount) {
        return (0, errorHandler_1.createResponse)(400, { message: 'Repayment amount exceeds disbursed amount' });
    }
    // Create transaction
    await index_1.Transaction.create({
        applicationId: application._id,
        type: transaction_1.TransactionType.REPAYMENT,
        amount: body.amount,
    });
    // Update application
    application.disbursedAmount -= body.amount;
    if (application.disbursedAmount === 0) {
        application.status = index_2.ApplicationStatus.REPAID;
    }
    await application.save();
    return (0, errorHandler_1.createResponse)(200, application);
};
// Reject application
const rejectApplicationHandler = async (event) => {
    await (0, db_1.connectDB)(process.env.MONGODB_URI);
    const body = JSON.parse(event.body || '{}');
    const application = await index_1.LineOfCreditApplication.findById(body.applicationId);
    if (!application) {
        return (0, errorHandler_1.createResponse)(404, { message: 'Application not found' });
    }
    if (application.status !== index_2.ApplicationStatus.OPEN) {
        return (0, errorHandler_1.createResponse)(400, { message: 'Application is not in Open state' });
    }
    application.status = index_2.ApplicationStatus.REJECTED;
    await application.save();
    return (0, errorHandler_1.createResponse)(200, application);
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
// Export wrapped handlers
exports.createApplication = (0, errorHandler_1.withErrorHandler)(createApplicationHandler);
exports.disburseFunds = (0, errorHandler_1.withErrorHandler)(disburseFundsHandler);
exports.repayFunds = (0, errorHandler_1.withErrorHandler)(repayFundsHandler);
exports.rejectApplication = (0, errorHandler_1.withErrorHandler)(rejectApplicationHandler);
exports.getUserApplications = (0, errorHandler_1.withErrorHandler)(getUserApplicationsHandler);
//# sourceMappingURL=applications.js.map