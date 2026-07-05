import connectDB from "@/lib/db.connection";
import { requireAuth } from "@/lib/requireAuth";
import {
  addItemToCart,
  clearUserCart,
  getUserCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/cart";

export default async function handler(req, res) {
  const { authorized, userId } = await requireAuth(req, res);

  if (!authorized) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Sign in to access your cart." });
  }

  try {
    await connectDB();

    if (req.method === "GET") {
      const cart = await getUserCart(userId);
      return res.status(200).json({ cart });
    }

    if (req.method === "POST") {
      const { productId, quantity = 1 } = req.body || {};

      if (!productId) {
        return res.status(400).json({ message: "Product ID is required." });
      }

      const cart = await addItemToCart(userId, productId, quantity);
      return res.status(200).json({ message: "Item added to cart.", cart });
    }

    if (req.method === "PATCH") {
      const { productId, quantity } = req.body || {};

      if (!productId || quantity === undefined) {
        return res
          .status(400)
          .json({ message: "Product ID and quantity are required." });
      }

      const cart = await updateCartItemQuantity(userId, productId, quantity);
      return res.status(200).json({ message: "Cart updated.", cart });
    }

    if (req.method === "DELETE") {
      const { productId, clearAll } = req.query;

      if (clearAll === "true") {
        const cart = await clearUserCart(userId);
        return res.status(200).json({ message: "Cart cleared.", cart });
      }

      if (!productId) {
        return res.status(400).json({ message: "Product ID is required." });
      }

      const cart = await removeCartItem(userId, productId);
      return res.status(200).json({ message: "Item removed from cart.", cart });
    }

    res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("Cart API error:", error);

    if (
      error.message === "Product not found." ||
      error.message === "Item not found in cart."
    ) {
      return res.status(404).json({ message: error.message });
    }

    if (error.message === "Quantity must be at least 1.") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to process cart request." });
  }
}
