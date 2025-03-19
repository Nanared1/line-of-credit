import { APIGatewayProxyEvent } from 'aws-lambda';
import { connectDB } from '../utils/db';
import { User } from '../models/index';
import { IUser } from '../types/index';
import { createResponse, withErrorHandler } from '../utils/errorHandler';
import { ICreateUserInput, IUpdateUserInput, IHandlerEvent } from '../types/handlers';

// Create user
const createUserHandler = async (event: APIGatewayProxyEvent) => {
  console.log('Creating user with event:', JSON.stringify(event, null, 2));
  await connectDB(process.env.MONGODB_URI!);
  const body = JSON.parse(event.body || '{}');
  console.log('Request body:', JSON.stringify(body, null, 2));
  
  try {
    const user = await User.create(body);
    console.log('User created successfully:', JSON.stringify(user, null, 2));
    return createResponse(201, user);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
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
  const body = JSON.parse(event.body || '{}');

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

// Export wrapped handlers
export const createUser = withErrorHandler(createUserHandler);
export const getUser = withErrorHandler(getUserHandler);
export const updateUser = withErrorHandler(updateUserHandler); 