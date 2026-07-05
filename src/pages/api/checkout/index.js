import connectDB from "@/lib/db.connection";
import { requireAuth } from "@/lib/requireAuth";
import { clearUserCart, getOrCreateCart } from "@/lib/cart";
import { validateCheckoutData } from "@/lib/validation";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  }

  const { authorized, userId } = await requireAuth(req, res);

  if (!authorized) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Sign in to checkout." });
  }

  try {
    const validation = validateCheckoutData(req.body);

    if (!validation.valid) {
      return res
        .status(400)
        .json({ message: "Validation failed.", errors: validation.errors });
    }

    await connectDB();

    const cart = await getOrCreateCart(userId);
    for (const item of cart.items) {
      const product = await ProductModel.findOne({
        id: item.productId,
      });

      if (!product) {
        return res.status(404).json({
          message: `${item.title} not found.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Only ${product.stock} left in stock for ${product.title}.`,
        });
      }
    }
    if (!cart.items.length) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      title: item.title,
      price: item.price,
      thumbnail: item.thumbnail,
      quantity: item.quantity,
      subtotal: Number((item.price * item.quantity).toFixed(2)),
    }));

    const orderTotal = Number(
      orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
    );

    const order = await OrderModel.create({
      userId,
      items: orderItems,
      orderTotal,
      customerInfo: validation.data,
      status: "pending",
    });

    for (const item of cart.items) {
      const product = await ProductModel.findOneAndUpdate(
        { id: item.productId },
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        { new: true },
      );

      if (product.stock <= 0) {
        await ProductModel.updateOne(
          { id: item.productId },
          {
            availabilityStatus: "Out of Stock",
          },
        );
      } else if (product.stock <= 5) {
        await ProductModel.updateOne(
          { id: item.productId },
          {
            availabilityStatus: "Low Stock",
          },
        );
      } else {
        await ProductModel.updateOne(
          { id: item.productId },
          {
            availabilityStatus: "In Stock",
          },
        );
      }
    }

    await clearUserCart(userId);

    return res.status(201).json({
      message: "Order placed successfully.",
      order: {
        id: order._id.toString(),
        orderTotal: order.orderTotal,
        status: order.status,
        itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res
      .status(500)
      .json({ message: "Failed to process checkout. Please try again." });
  }
}
