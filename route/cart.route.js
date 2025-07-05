import { addToCart, getCart, updateCartItem, removeCartItem, clearCart } from "../controller/cart.controller.js";

export default async function cartRoutes(fastify, opts, done) {
    // Add item to cart
    fastify.post("/cart/add", addToCart);

    // Get cart for user
    fastify.get("/cart", getCart);

    // Update cart item
    fastify.put("/cart/item", updateCartItem);

    // Remove cart item
    fastify.delete("/cart/item", removeCartItem);

    // Clear cart
    fastify.delete("/cart/clear", clearCart);

    done();
} 