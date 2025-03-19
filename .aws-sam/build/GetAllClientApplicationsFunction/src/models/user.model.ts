import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/index';

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  creditLimit: { type: Number, required: true, min: 0 },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indices for User
UserSchema.index({ email: 1 }, { unique: true });

// Update timestamps middleware
const updateTimestamp = function(this: IUser, next: Function) {
  this.updatedAt = new Date();
  next();
};

UserSchema.pre('save', updateTimestamp);

export const User = mongoose.model<IUser>('User', UserSchema); 