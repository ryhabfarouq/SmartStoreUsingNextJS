import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 100,
    },

    description: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 20000,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    stock: {
      type: Number,
      default: 0,
    },

    tags: [String],

    brand: {
      type: String,
      required: true,
    },

    availabilityStatus: {
      type: String,
      enum: ["In Stock", "Low Stock", "Out of Stock"],
      default: "In Stock",
    },

    images: [String],

    thumbnail: String,
  },
  {
    timestamps: true,
  },
);

const ProductModel =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default ProductModel;

ProductModel.syncIndexes();
