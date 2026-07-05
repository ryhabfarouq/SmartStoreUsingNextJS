import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true,
    },
    title: String,
    price: Number,
    thumbnail: String,
    quantity: Number,
    subtotal: Number,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    orderTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    customerInfo: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      notes: { type: String, trim: true, default: "" },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const OrderModel = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default OrderModel;
