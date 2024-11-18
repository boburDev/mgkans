import mongoose, { Document, Schema } from 'mongoose';

// Define an interface for the document
interface CategoryModel extends Document {
    title?: string;
    route: string;
    colour: string;
    path: string;
    order: number;
}

// Create the schema
const CategorySchema = new Schema<CategoryModel>(
    {
        title: { type: String, required: false },
        route: { type: String, required: true },
        colour: { type: String, required: true },
        path: { type: String, required: true },
        order: { type: Number, required: true, default: 1 }
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    }
);

CategorySchema.pre("save", async function (next) {
    if (!this.isNew) return next();

    try {
        const lastDoc = await Category.findOne().sort({ order: -1 });
        this.order = lastDoc ? lastDoc.order + 1 : 1;
        next();
    } catch (error: any) {
        next(error);
    }
});



const Category = mongoose.model<CategoryModel>('Category', CategorySchema);
export default Category;
export { CategoryModel };
