import mongoose, { Document, Schema } from 'mongoose';

interface Sale extends Document {
    path: string;
    url: string;
}

const saleSchema: Schema = new Schema(
    {
        path: { type: String, required: true },
        url: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const SaleModel = mongoose.model<Sale>('Sale', saleSchema);

export default SaleModel;