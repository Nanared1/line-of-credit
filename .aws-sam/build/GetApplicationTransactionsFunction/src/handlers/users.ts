import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { connectDB } from '../utils/db';
import { User } from '../models/user.model';
import { IHandlerEvent, ICreateUserInput, IUpdateUserInput } from '../types/handlers';
import { createResponse, withErrorHandler } from '../utils/errorHandler';
import { CORS_HEADERS } from '../utils/errorHandler';

// Create user
const createUserHandler = async (event: IHandlerEvent<ICreateUserInput>) => {
  await connectDB(process.env.MONGODB_URI!);
  const body = JSON.parse(event.body) as ICreateUserInput;
  const user = await User.create(body);
  return createResponse(201, user);
};

// Get user
const getUserHandler = async (event: IHandlerEvent) => {
  await connectDB(process.env.MONGODB_URI!);
  const userId = event.pathParameters?.userId;

  if (!userId) {
    return createResponse(400, { message: 'User ID is required' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return createResponse(404, { message: 'User not found' });
  }

  return createResponse(200, user);
};

// Update user
const updateUserHandler = async (event: IHandlerEvent<IUpdateUserInput>) => {
  await connectDB(process.env.MONGODB_URI!);
  const userId = event.pathParameters?.userId;
  const body = JSON.parse(event.body) as IUpdateUserInput;

  if (!userId) {
    return createResponse(400, { message: 'User ID is required' });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: body },
    { new: true }
  );

  if (!user) {
    return createResponse(404, { message: 'User not found' });
  }

  return createResponse(200, user);
};

// Get all users (admin only)
const getAllUsersHandler = async (event: IHandlerEvent): Promise<APIGatewayProxyResult> => {
  try {
    // const adminToken = event.headers['X-Admin-Token'];
    // console.log('Admin token present:', !!adminToken);

    // if (!adminToken) {
    //   console.log('No admin token provided');
    //   return createResponse(401, { message: 'Admin token is required' });
    // }

    try {
      await connectDB(process.env.MONGODB_URI!);
      console.log('Successfully connected to MongoDB');
    } catch (dbError: any) {
      console.error('MongoDB connection error:', dbError);
      return createResponse(500, { 
        message: 'Failed to connect to database', 
        error: dbError.message 
      });
    }

    console.log('Fetching users...');
    const users = await User.find().sort({ createdAt: -1 })
    
    console.log(`Successfully found ${users.length} users`);

    return createResponse(200, users);
  } catch (error: any) {
    console.error('Error in getAllUsersHandler:', error);
    console.error('Error stack:', error.stack);
    return createResponse(500, { 
      message: 'Internal server error',
      error: error.message,
      stack: error.stack
    });
  }
};

// Export wrapped handlers
export const createUser = withErrorHandler(createUserHandler);
export const getUser = withErrorHandler(getUserHandler);
export const updateUser = withErrorHandler(updateUserHandler); 
export const getAllUsers = withErrorHandler(getAllUsersHandler);