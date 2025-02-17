import mongoose, { Document, Schema } from 'mongoose';

interface CategoryModel extends Document {
    title?: string;
    route: string;
    colour: string;
    path: string;
    categoryId: string;
    order: number;
}

const CategorySchema = new Schema<CategoryModel>(
    {
        title: { type: String, required: false },
        route: { type: String, required: true },
        colour: { type: String, required: true },
        path: { type: String, required: true },
        categoryId: { type: String, required: false },
        order: { type: Number, required: true, default: 1 }
    },
    {
        timestamps: true,
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
