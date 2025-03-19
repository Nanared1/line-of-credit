import { connectDB, withTransaction } from '../utils/db';
import { LineOfCreditApplication, User, Transaction } from '../models/index';
import { TransactionType } from '../types/transaction';
import { createResponse, withErrorHandler } from '../utils/errorHandler';
import { 
  ICreateApplicationInput, 
  IDisburseFundsInput, 
  IRepayFundsInput, 
  IRejectApplicationInput, 
  IHandlerEvent,
} from '../types/handlers';
import { ApplicationStatus } from '../types/application';

const EXPRESS_DELIVERY_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

// Create application
const createApplicationHandler = async (event: IHandlerEvent<ICreateApplicationInput>) => {
  await connectDB(process.env.MONGODB_URI!);
  const body = JSON.parse(event.body) as ICreateApplicationInput;

  const user = await User.findById(body.userId);
  if (!user) {
    return createResponse(404, { message: 'User not found' });
  }

  if (body.requestedAmount > user.creditLimit) {
    return createResponse(400, { message: 'Requested amount exceeds credit limit' });
  }

  const application = await LineOfCreditApplication.create({
    userId: body.userId,
    requestedAmount: body.requestedAmount,
    expressDelivery: body.expressDelivery || false,
    tip: body.tip || 0,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return createResponse(201, application);
};

// Disburse funds
const disburseFundsHandler = async (event: IHandlerEvent<IDisburseFundsInput>) => {
  await connectDB(process.env.MONGODB_URI!);
  const body = JSON.parse(event.body) as IDisburseFundsInput;

  const result = await withTransaction(async (session) => {
    // Find the application with lock
    const application = await LineOfCreditApplication.findOneAndUpdate(
      { 
        _id: body.applicationId,
        status: ApplicationStatus.OPEN 
      },
      { $set: { status: ApplicationStatus.PROCESSING } },
      { new: true, session }
    );
    
    if (!application) {
      throw new Error('Application not found or not in Open state');
    }

    // Check express delivery window
    if (application.expressDelivery) {
      const now = new Date();
      const created = new Date(application.createdAt);
      const timeElapsed = now.getTime() - created.getTime();
      
      if (timeElapsed > EXPRESS_DELIVERY_WINDOW_MS) {
        application.status = ApplicationStatus.OPEN;
        await application.save({ session });
        throw new Error('Express delivery window has expired');
      }
    }

    // Find the user
    const user = await User.findById(application.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const totalAmount = body.amount + (body.tip || 0);
    if (application.disbursedAmount + totalAmount > user.creditLimit) {
      application.status = ApplicationStatus.OPEN;
      await application.save({ session });
      throw new Error('Disbursement would exceed credit limit');
    }

    // Create transaction record
    await Transaction.create([{
      applicationId: application._id,
      type: TransactionType.DISBURSEMENT,
      amount: totalAmount,
      createdAt: new Date()
    }], { session });

    // Update application
    application.disbursedAmount += totalAmount;
    application.status = ApplicationStatus.OUTSTANDING;
    application.expressDelivery = body.expressDelivery || false;
    application.tip = (application.tip || 0) + (body.tip || 0);
    application.updatedAt = new Date();
    await application.save({ session });

    return application;
  });

  return createResponse(200, result);
};

// Repay funds
const repayFundsHandler = async (event: IHandlerEvent<IRepayFundsInput>) => {
  await connectDB(process.env.MONGODB_URI!);
  const body = JSON.parse(event.body) as IRepayFundsInput;

  const result = await withTransaction(async (session) => {
    // Find the application with lock
    const application = await LineOfCreditApplication.findOneAndUpdate(
      { 
        _id: body.applicationId,
        status: ApplicationStatus.OUTSTANDING 
      },
      { $set: { status: ApplicationStatus.PROCESSING } },
      { new: true, session }
    );
    
    if (!application) {
      throw new Error('Application not found or not in Outstanding state');
    }

    if (body.amount <= 0) {
      application.status = ApplicationStatus.OUTSTANDING;
      await application.save({ session });
      throw new Error('Repayment amount must be greater than 0');
    }

    if (body.amount > application.disbursedAmount) {
      application.status = ApplicationStatus.OUTSTANDING;
      await application.save({ session });
      throw new Error('Repayment amount exceeds disbursed amount');
    }

    // Create transaction record
    await Transaction.create([{
      applicationId: application._id,
      type: TransactionType.REPAYMENT,
      amount: body.amount,
      createdAt: new Date()
    }], { session });

    // Update application
    application.disbursedAmount -= body.amount;
    application.status = application.disbursedAmount === 0 
      ? ApplicationStatus.REPAID 
      : ApplicationStatus.OUTSTANDING;
    application.updatedAt = new Date();
    await application.save({ session });

    return application;
  });

  return createResponse(200, result);
};

// Reject application
const rejectApplicationHandler = async (event: IHandlerEvent<IRejectApplicationInput>) => {
  await connectDB(process.env.MONGODB_URI!);
  const body = JSON.parse(event.body) as IRejectApplicationInput;

  // // Verify admin token
  // const adminToken = event.headers['x-admin-token'];
  // if (!adminToken) {
  //   return createResponse(401, { message: 'Unauthorized: Admin access required' });
  // }

  const result = await withTransaction(async (session) => {
    const application = await LineOfCreditApplication.findOneAndUpdate(
      { 
        _id: body.applicationId,
        status: ApplicationStatus.OPEN 
      },
      { 
        $set: { 
          status: ApplicationStatus.REJECTED,
          updatedAt: new Date()
        }
      },
      { new: true, session }
    );

    if (!application) {
      throw new Error('Application not found or not in Open state');
    }

    return application;
  });

  return createResponse(200, result);
};

// Get user's applications
const getUserApplicationsHandler = async (event: IHandlerEvent) => {
  await connectDB(process.env.MONGODB_URI!);
  const userId = event.pathParameters?.userId;

  if (!userId) {
    return createResponse(400, { message: 'User ID is required' });
  }

  const applications = await LineOfCreditApplication.find({ userId })
    .sort({ createdAt: -1 });

  return createResponse(200, applications);
};

// Get application transactions
const getApplicationTransactionsHandler = async (event: IHandlerEvent) => {
  await connectDB(process.env.MONGODB_URI!);
  const applicationId = event.pathParameters?.applicationId;

  if (!applicationId) {
    return createResponse(400, { message: 'Application ID is required' });
  }

  const transactions = await Transaction.find({ applicationId })
    .sort({ createdAt: -1 });

  return createResponse(200, transactions);
};

// Get all applications (admin only)
const getAllApplicationsHandler = async (event: IHandlerEvent) => {
  await connectDB(process.env.MONGODB_URI!);
  console.log('Starting getAllApplicationsHandler', event.body);
  
  const applications = await LineOfCreditApplication.find().sort({ createdAt: -1 });

  return createResponse(200, applications);

};

// Export all handlers
export const createApplication = withErrorHandler(createApplicationHandler);
export const disburseFunds = withErrorHandler(disburseFundsHandler);
export const repayFunds = withErrorHandler(repayFundsHandler);
export const rejectApplication = withErrorHandler(rejectApplicationHandler);
export const getUserApplications = withErrorHandler(getUserApplicationsHandler);
export const getApplicationTransactions = withErrorHandler(getApplicationTransactionsHandler);
export const getAllClientApplications = withErrorHandler(getAllApplicationsHandler); 