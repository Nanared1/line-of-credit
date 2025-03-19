"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineOfCreditApplication = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const index_1 = require("../types/index");
const LineOfCreditApplicationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: Object.values(index_1.ApplicationStatus),
        default: index_1.ApplicationStatus.OPEN,
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
const updateTimestamp = function (next) {
    this.updatedAt = new Date();
    next();
};
LineOfCreditApplicationSchema.pre('save', updateTimestamp);
exports.LineOfCreditApplication = mongoose_1.default.model('LineOfCreditApplication', LineOfCreditApplicationSchema);
//# sourceMappingURL=application.model.js.map