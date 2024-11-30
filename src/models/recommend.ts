import mongoose, { Document, Schema } from 'mongoose';

interface Recommend extends Document {
    productId: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId;
}

const recommendSchema: Schema = new Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
    },
    {
        timestamps: true,
    }
);

const RecommendModel = mongoose.model<Recommend>('Recommend', recommendSchema);

export default RecommendModel;