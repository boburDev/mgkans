import mongoose, { Document, Schema } from 'mongoose';

interface LUser extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    company_name: string;
    pnfl: string;
    status: number;
    point: number;
    conterAgentId: string;
}

const legalUserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    status: { type: Number, required: false, default: 1 },
    point: { type: Number, required: false, default: 0 },
    company_name: { type: String, required: true },
    pnfl: { type: String, required: true, unique: true },
    conterAgentId: { type: String, required: false, unique: true },
});

const legalUser = mongoose.model<LUser>('LUser', legalUserSchema);
export default legalUser;
export { LUser };