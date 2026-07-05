import mongoose from "mongoose";
import CartModel from "@/models/Cart.model";
import ProductModel from "@/models/Product.model";

export function serializeCart(cart) {
  if (!cart) {
    return { items: [], itemCount: 0, total: 0 };
  }

  const items = cart.items.map((item) => ({
    productId: item.productId,
    title: item.title,
    price: item.price,
    thumbnail: item.thumbnail,
    quantity: item.quantity,
    subtotal: Number((item.price * item.quantity).toFixed(2)),
  }));

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = Number(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
  );

  return {
    id: cart._id?.toString(),
    items,
    itemCount,
    total,
    updatedAt: cart.updatedAt,
  };
}

export async function getOrCreateCart(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  let cart = await CartModel.findOne({ userId });

  if (!cart) {
    cart = await CartModel.create({ userId, items: [] });
  }

  return cart;
}

export async function getUserCart(userId) {
  const cart = await getOrCreateCart(userId);
  return serializeCart(cart);
}

export async function addItemToCart(userId, productId, quantity = 1) {
  const numericProductId = Number(productId);
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));

  const product = await ProductModel.findOne({ id: numericProductId }).lean();
  if (!product) {
    throw new Error("Product not found.");
  }

  const cart = await getOrCreateCart(userId);
  const existingIndex = cart.items.findIndex((item) => item.productId === numericProductId);

  if (existingIndex >= 0) {
    cart.items[existingIndex].quantity += qty;
  } else {
    cart.items.push({
      productId: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      quantity: qty,
    });
  }

  await cart.save();
  return serializeCart(cart);
}

export async function updateCartItemQuantity(userId, productId, quantity) {
  const numericProductId = Number(productId);
  const qty = Math.floor(Number(quantity));

  if (qty < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((entry) => entry.productId === numericProductId);

  if (!item) {
    throw new Error("Item not found in cart.");
  }

  item.quantity = qty;
  await cart.save();
  return serializeCart(cart);
}

export async function removeCartItem(userId, productId) {
  const numericProductId = Number(productId);
  const cart = await getOrCreateCart(userId);

  const initialLength = cart.items.length;
  cart.items = cart.items.filter((item) => item.productId !== numericProductId);

  if (cart.items.length === initialLength) {
    throw new Error("Item not found in cart.");
  }

  await cart.save();
  return serializeCart(cart);
}

export async function clearUserCart(userId) {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return serializeCart(cart);
}
