import mongoose, { Schema, Document } from "mongoose";

export interface IDiscount extends Document {
    summa: number;
    procent: number;
}

const DiscountSchema: Schema = new Schema(
    {
        summa: {
            type: Number,
            required: true,
            min: 0,
        },
        procent: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
    },
    { timestamps: true }
);

export const Discount = mongoose.model<IDiscount>("Discount", DiscountSchema);
