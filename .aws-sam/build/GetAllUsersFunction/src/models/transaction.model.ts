import mongoose, { Schema } from 'mongoose';
import { ITransaction, TransactionType } from '../types/index';

const TransactionSchema = new Schema<ITransaction>({
  applicationId: { type: Schema.Types.ObjectId, ref: 'LineOfCreditApplication', required: true },
  type: { 
    type: String, 
    enum: Object.values(TransactionType),
    required: true 
  },
  amount: { type: Number, required: true, min: 0 },
  timestamp: { type: Date, default: Date.now }
});

// Indices for Transaction
TransactionSchema.index({ applicationId: 1 });
TransactionSchema.index({ timestamp: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema); 