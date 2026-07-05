import connectDB from "@/lib/db.connection";
import ProductModel from "@/models/Product.model";
import { requireAuth } from "@/lib/requireAuth";

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
      const skip = Math.max(Number(req.query.skip) || 0, 0);
      const search = req.query.search || "";
      const sortBy = req.query.sortBy; // 'price' or 'stock'
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

      let query = {};
      if (search) {
        query = {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
          ],
        };
      }

      let sort = {};
      if (sortBy === "price" || sortBy === "stock") {
        sort[sortBy] = sortOrder;
      } else {
        sort["id"] = 1; // Default sort by numeric ID
      }

      const total = await ProductModel.countDocuments(query);
      const products = await ProductModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({
        products: JSON.parse(JSON.stringify(products)),
        total,
        limit,
        skip,
      });
    }

    if (req.method === "POST") {
      const { authorized } = await requireAuth(req, res);
      if (!authorized) {
        return res.status(401).json({ message: "Unauthorized. Sign in to create products." });
      }

      let numericId = req.body.id;
      if (!numericId) {
        const lastProduct = await ProductModel.findOne().sort({ id: -1 });
        numericId = lastProduct && lastProduct.id ? lastProduct.id + 1 : 1;
      }

      const productData = {
        ...req.body,
        id: numericId,
      };

      const product = await ProductModel.create(productData);
      return res.status(201).json({ message: "Done", data: product });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("API error in products index:", error);
    return res.status(500).json({ message: "Failed to load/create products.", error: error.message });
  }
}
