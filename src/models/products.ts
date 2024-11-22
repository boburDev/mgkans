import mongoose, { Document, Schema } from 'mongoose';

interface Product extends Document {
    name: string;
    definition: string;
    path: string;
    price: number;
    rate: number;
    count: number;
    sale: boolean;
    hashtag: string[];
    subCategoryId: mongoose.Types.ObjectId
}


const productSchema: Schema = new Schema({
    name: { type: String, required: true },
    definition: { type: String, required: true },
    path: { type: String, required: false },
    price: { type: Number, required: true, default: 0 },
    rate: { type: Number, required: true, default: 0 },
    count: { type: Number, required: false, default: 0 },
    sale: { type: Number, required: false, default: 0 },
    hashtag: { type: [String], required: false },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true },
});

const ProductModel = mongoose.model<Product>('Product', productSchema);

interface ProductPicture extends Document {
    productId: mongoose.Types.ObjectId;
    path: string;
}

const productPictureSchema: Schema = new Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    path: { type: String, required: true },
});

const ProductPictureModel = mongoose.model<ProductPicture>('ProductPicture', productPictureSchema);

interface ProductComment extends Document {
    productId: mongoose.Types.ObjectId;
    userName: string;
    comment: string;
    date: Date;
}

const productCommentSchema: Schema = new Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userName: { type: String, required: true },
    comment: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
});

const ProductCommentModel = mongoose.model<ProductComment>('ProductComment', productCommentSchema);


export default ProductModel;
export { ProductPictureModel, ProductCommentModel };