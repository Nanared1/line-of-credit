import mongoose, { Schema } from 'mongoose';
import { ILineOfCreditApplication, ApplicationStatus } from '../types/index';

const LineOfCreditApplicationSchema = new Schema<ILineOfCreditApplication>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.OPEN,
    required: true 
  },
  requestedAmount: { type: Number, required: true, min: 0 },
  disbursedAmount: { type: Number, default: 0, min: 0 },
  expressDelivery: { type: Boolean, default: false },
  tip: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indices for LineOfCreditApplication
LineOfCreditApplicationSchema.index({ userId: 1 });
LineOfCreditApplicationSchema.index({ status: 1 });
LineOfCreditApplicationSchema.index({ createdAt: -1 });

// Update timestamps middleware
const updateTimestamp = function(this: ILineOfCreditApplication, next: () => void) {
  this.updatedAt = new Date();
  next();
};

LineOfCreditApplicationSchema.pre('save', updateTimestamp);

export const LineOfCreditApplication = mongoose.model<ILineOfCreditApplication>('LineOfCreditApplication', LineOfCreditApplicationSchema); 