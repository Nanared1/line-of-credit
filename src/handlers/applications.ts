import { connectDB, withTransaction } from '../utils/db';
import { LineOfCreditApplication, User, Transaction } from '../models/index';
import { ApplicationStatus } from '../types/index';
import { TransactionType } from '../types/transaction';
import { createResponse, withErrorHandler } from '../utils/errorHandler';
import { 
  ICreateApplicationInput, 
  IDisburseFundsInput, 
  IRepayFundsInput, 
  IRejectApplicationInput, 
  IHandlerEvent 
} from '../types/handlers';

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
  });

  return createResponse(201, application);
};

// Disburse funds
const disburseFundsHandler = async (event: IHandlerEvent<IDisburseFundsInput>) => {
  await connectDB(process.env.MONGODB_URI!);
  const body = JSON.parse(event.body) as IDisburseFundsInput;

  const result = await withTransaction(async (session) => {
    // Find the application
    const application = await LineOfCreditApplication.findById(body.applicationId);
    
    if (!application) {
      throw new Error('Application not found');
    }

    if (application.status !== ApplicationStatus.OPEN) {
      throw new Error('Application is not in Open state');
    }

    // Find the user
    const user = await User.findById(application.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const totalAmount = body.amount + (body.tip || 0);
    if (application.disbursedAmount + totalAmount > user.creditLimit) {
      throw new Error('Disbursement would exceed credit limit');
    }

    // Create transaction record
    await Transaction.create([{
      applicationId: application._id,
      type: TransactionType.DISBURSEMENT,
      amount: totalAmount,
    }], { session });

    // Update application
    application.disbursedAmount += totalAmount;
    application.status = ApplicationStatus.OUTSTANDING;
    application.expressDelivery = body.expressDelivery || false;
    application.tip = (application.tip || 0) + (body.tip || 0);
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
    // Find the application
    const application = await LineOfCreditApplication.findById(body.applicationId);
    
    if (!application) {
      throw new Error('Application not found');
    }

    if (application.status !== ApplicationStatus.OUTSTANDING) {
      throw new Error('Application is not in Outstanding state');
    }

    if (body.amount > application.disbursedAmount) {
      throw new Error('Repayment amount exceeds disbursed amount');
    }

    // Create transaction record
    await Transaction.create([{
      applicationId: application._id,
      type: TransactionType.REPAYMENT,
      amount: body.amount,
    }], { session });

    // Update application
    application.disbursedAmount -= body.amount;
    if (application.disbursedAmount === 0) {
      application.status = ApplicationStatus.REPAID;
    }
    await application.save({ session });

    return application;
  });

  return createResponse(200, result);
};

// Reject application
const rejectApplicationHandler = async (event: IHandlerEvent<IRejectApplicationInput>) => {
  await connectDB(process.env.MONGODB_URI!);
  const body = JSON.parse(event.body) as IRejectApplicationInput;

  const application = await LineOfCreditApplication.findOneAndUpdate(
    { _id: body.applicationId },
    { 
      $set: { 
        status: ApplicationStatus.REJECTED
      }
    },
    { new: true }
  );

  if (!application) {
    return createResponse(404, { message: 'Application not found' });
  }

  if (application.status !== ApplicationStatus.OPEN) {
    return createResponse(400, { message: 'Application is not in Open state' });
  }

  return createResponse(200, application);
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

// Export wrapped handlers
export const createApplication = withErrorHandler(createApplicationHandler);
export const disburseFunds = withErrorHandler(disburseFundsHandler);
export const repayFunds = withErrorHandler(repayFundsHandler);
export const rejectApplication = withErrorHandler(rejectApplicationHandler);
export const getUserApplications = withErrorHandler(getUserApplicationsHandler); 