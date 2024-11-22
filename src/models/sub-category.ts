import mongoose, { Document, Schema } from 'mongoose';

interface ISubCategory extends Document {
    name: string;
    order: number;
    categoryId: Schema.Types.ObjectId;
}

const SubCategorySchema = new Schema<ISubCategory>(
    {
        name: { type: String, required: true },
        order: { type: Number, required: true, default: 1 },
        categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    },
    { timestamps: true }
);

SubCategorySchema.pre("save", async function (next) {
    if (!this.isNew) return next();

    try {
        const lastSubCategory = await SubCategory.findOne({ categoryId: this.categoryId }).sort({ order: -1 });
        this.order = lastSubCategory ? lastSubCategory.order + 1 : 1;
        next();
    } catch (error: any) {
        next(error);
    }
});

const SubCategory = mongoose.model<ISubCategory>('SubCategory', SubCategorySchema);
export default SubCategory;
export { ISubCategory };
