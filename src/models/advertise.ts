import mongoose, { Document, Schema } from 'mongoose';

interface Advertising extends Document {
    path: string;
    url: string;
    categoryId?: mongoose.Types.ObjectId;
}

const advertisingSchema: Schema = new Schema(
    {
        path: { type: String, required: true },
        url: { type: String, required: true },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: false
        },
    },
    {
        timestamps: true,
    }
);

const AdvertisingModel = mongoose.model<Advertising>('Advertising', advertisingSchema);

export default AdvertisingModel;