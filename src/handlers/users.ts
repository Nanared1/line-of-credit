import { connectDB } from '../utils/db';
import { User } from '../models/index';
import { createResponse, withErrorHandler } from '../utils/errorHandler';
import { IHandlerEvent, ICreateUserInput, IUpdateUserInput } from '../types/handlers';

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

// Export wrapped handlers
export const createUser = withErrorHandler(createUserHandler);
export const getUser = withErrorHandler(getUserHandler);
export const updateUser = withErrorHandler(updateUserHandler); 