import mongoose, { Document, Schema } from 'mongoose';

interface PUser extends Document {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    point?: number;
}

const physicalUserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    point: { type: Number, required: false, default: 0 },
});

const physicalUser = mongoose.model<PUser>('PUser', physicalUserSchema);
export default physicalUser;
export { PUser };