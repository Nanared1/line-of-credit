import { Types } from 'mongoose';
export declare enum TransactionType {
    DISBURSEMENT = "Disbursement",
    REPAYMENT = "Repayment"
}
export interface ITransaction {
    _id: Types.ObjectId;
    applicationId: Types.ObjectId;
    type: TransactionType;
    amount: number;
    timestamp: Date;
}
