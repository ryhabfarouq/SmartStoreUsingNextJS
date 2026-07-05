import connectDB from "@/lib/db.connection";
import ProductModel from "@/models/Product.model";
import { requireAuth } from "@/lib/requireAuth";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    await connectDB();

    const query = isNaN(Number(id)) ? { _id: id } : { id: Number(id) };

    if (req.method === "GET") {
      const product = await ProductModel.findOne(query).lean();

      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }

      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
      return res.status(200).json(JSON.parse(JSON.stringify(product)));
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const { authorized } = await requireAuth(req, res);
      if (!authorized) {
        return res.status(401).json({ message: "Unauthorized. Sign in to update products." });
      }

      const updatedProduct = await ProductModel.findOneAndUpdate(
        query,
        { $set: req.body },
        { new: true, runValidators: true }
      ).lean();

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found." });
      }

      return res.status(200).json({
        message: "Product updated successfully",
        data: JSON.parse(JSON.stringify(updatedProduct)),
      });
    }

    if (req.method === "DELETE") {
      const { authorized } = await requireAuth(req, res);
      if (!authorized) {
        return res.status(401).json({ message: "Unauthorized. Sign in to delete products." });
      }

      const deletedProduct = await ProductModel.findOneAndDelete(query).lean();

      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found." });
      }

      return res.status(200).json({
        message: "Product deleted successfully",
        data: JSON.parse(JSON.stringify(deletedProduct)),
      });
    }

    res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("API error in product details dynamic route:", error);
    return res.status(500).json({ message: "Failed to handle product endpoint request.", error: error.message });
  }
}
