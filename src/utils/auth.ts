import jwt from 'jsonwebtoken';
import { User } from '../models/index';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'your-admin-secret-key';

export const verifyAdminToken = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, ADMIN_SECRET) as { role: string };
    return decoded.role === 'admin';
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return false;
  }
};

export const generateAdminToken = (): string => {
  return jwt.sign({ role: 'admin' }, ADMIN_SECRET, { expiresIn: '24h' });
};

export const verifyAdmin = async (userId: string): Promise<boolean> => {
  try {
    const user = await User.findById(userId);
    return user?.isAdmin || false;
  } catch (error) {
    return false;
  }
}; 