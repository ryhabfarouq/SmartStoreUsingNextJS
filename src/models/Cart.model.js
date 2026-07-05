import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    thumbnail: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const CartModel = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default CartModel;
