import mongoose, { Document, Schema } from 'mongoose';

interface OrderItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

interface Order extends Document {
    userId: mongoose.Types.ObjectId;
    items: OrderItem[];
    totalAmount: number;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema: Schema = new Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const orderSchema: Schema = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: { type: [orderItemSchema], required: true },
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

const OrderModel = mongoose.model<Order>("Order", orderSchema);

export default OrderModel;