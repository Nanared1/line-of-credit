import mongoose from 'mongoose';
import { ITransaction } from '../types/index';
export declare const Transaction: mongoose.Model<ITransaction, {}, {}, {}, mongoose.Document<unknown, {}, ITransaction> & ITransaction & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
