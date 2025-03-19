import mongoose from 'mongoose';
import { ILineOfCreditApplication } from '../types/index';
export declare const LineOfCreditApplication: mongoose.Model<ILineOfCreditApplication, {}, {}, {}, mongoose.Document<unknown, {}, ILineOfCreditApplication> & ILineOfCreditApplication & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
