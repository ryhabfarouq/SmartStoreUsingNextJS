import connectDB from "./db.connection";
import ProductModel from "@/models/Product.model";

export async function fetchProducts({ limit = 30, skip = 0 } = {}) {
  await connectDB();
  const products = await ProductModel.find()
    .skip(Number(skip) || 0)
    .limit(Number(limit) || 30)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

export async function fetchProductsPage({ limit = 30, skip = 0 } = {}) {
  await connectDB();
  const total = await ProductModel.countDocuments();
  const products = await ProductModel.find()
    .skip(Number(skip) || 0)
    .limit(Number(limit) || 30)
    .lean();
  return {
    products: JSON.parse(JSON.stringify(products)),
    total,
    limit: Number(limit),
    skip: Number(skip),
  };
}

export async function fetchProductById(id) {
  await connectDB();
  const query = isNaN(Number(id)) ? { _id: id } : { id: Number(id) };
  const product = await ProductModel.findOne(query).lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
}
