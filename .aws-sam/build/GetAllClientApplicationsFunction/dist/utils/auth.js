"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = exports.generateAdminToken = exports.verifyAdminToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../models/index");
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'your-admin-secret-key';
const verifyAdminToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, ADMIN_SECRET);
        return decoded.role === 'admin';
    }
    catch (error) {
        console.error('Error verifying admin token:', error);
        return false;
    }
};
exports.verifyAdminToken = verifyAdminToken;
const generateAdminToken = () => {
    return jsonwebtoken_1.default.sign({ role: 'admin' }, ADMIN_SECRET, { expiresIn: '24h' });
};
exports.generateAdminToken = generateAdminToken;
const verifyAdmin = async (userId) => {
    try {
        const user = await index_1.User.findById(userId);
        return user?.isAdmin || false;
    }
    catch (error) {
        return false;
    }
};
exports.verifyAdmin = verifyAdmin;
//# sourceMappingURL=auth.js.map