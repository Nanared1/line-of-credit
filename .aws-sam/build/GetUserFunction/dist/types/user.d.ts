import { Types } from 'mongoose';
export interface IUser {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    creditLimit: number;
    createdAt: Date;
    updatedAt: Date;
}
