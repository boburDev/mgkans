import mongoose, { Document, Schema } from 'mongoose';

interface FavoriteProduct extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    addedAt: Date;
}

const favoriteProductSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    addedAt: { type: Date, required: true, default: Date.now },
});

const FavoriteProductModel = mongoose.model<FavoriteProduct>("FavoriteProduct", favoriteProductSchema);

export default FavoriteProductModel;
