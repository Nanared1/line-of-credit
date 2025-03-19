"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let isConnected = false;
const connectDB = async (uri) => {
    if (isConnected) {
        return;
    }
    try {
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            retryWrites: true,
            retryReads: true,
            directConnection: true,
        });
        isConnected = true;
        console.log('Connected to MongoDB');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    if (!isConnected) {
        return;
    }
    try {
        await mongoose_1.default.disconnect();
        isConnected = false;
        console.log('Disconnected from MongoDB');
    }
    catch (error) {
        console.error('MongoDB disconnection error:', error);
        throw error;
    }
};
exports.disconnectDB = disconnectDB;
//# sourceMappingURL=db.js.map