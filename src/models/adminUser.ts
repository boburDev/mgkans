import mongoose, { Schema, Document } from 'mongoose';

export interface Admin extends Document {
    email: string;
    password: string;
    role: 'user' | 'admin';
}

const AdminSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['user', 'admin'], default: 'user' },
});

export default mongoose.model<Admin>('Admin', AdminSchema);
