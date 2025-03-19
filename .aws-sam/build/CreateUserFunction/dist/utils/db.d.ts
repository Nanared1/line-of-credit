import mongoose from 'mongoose';
export declare const connectDB: (uri: string) => Promise<void>;
export declare const disconnectDB: () => Promise<void>;
export declare const withTransaction: <T>(callback: (session: mongoose.ClientSession) => Promise<T>) => Promise<T>;
