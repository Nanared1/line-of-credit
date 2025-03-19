import mongoose from 'mongoose';
import { IUser } from '../types/index';
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}>, any>;
