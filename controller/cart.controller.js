import { Cart } from "../model/cart.Model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// 1. Add item to cart
const addToCart = async (request, reply) => {
    try {
        const { user_id, product_id, quantity } = request.body;
        if (!user_id || !product_id || !quantity) {
            return reply.code(400).send(new ApiResponse(400, {}, "user_id, product_id, and quantity are required"));
        }
        let cart = await Cart.findOne({ user_id });
        if (!cart) {
            cart = await Cart.create({ user_id, items: [{ product_id, quantity }] });
        } else {
            const itemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product_id, quantity });
            }
            await cart.save();
        }
        return reply.code(200).send(new ApiResponse(200, cart, "Item added to cart"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while adding to cart"));
    }
};

// 2. Get Cart for user
const getCart = async (request, reply) => {
    try {
        const { user_id } = request.query;
        if (!user_id) {
            return reply.code(400).send(new ApiResponse(400, {}, "user_id is required"));
        }
        const cart = await Cart.findOne({ user_id }).populate("items.product_id");
        return reply.code(200).send(new ApiResponse(200, cart || {}, "Cart fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching cart"));
    }
};

// 3. Update Cart Item
const updateCartItem = async (request, reply) => {
    try {
        const { user_id, product_id, quantity } = request.body;
        if (!user_id || !product_id || quantity == null) {
            return reply.code(400).send(new ApiResponse(400, {}, "user_id, product_id, and quantity are required"));
        }
        const cart = await Cart.findOne({ user_id });
        if (!cart) {
            return reply.code(404).send(new ApiResponse(404, {}, "Cart not found"));
        }
        const item = cart.items.find(item => item.product_id.toString() === product_id);
        if (!item) {
            return reply.code(404).send(new ApiResponse(404, {}, "Item not found in cart"));
        }
        item.quantity = quantity;
        await cart.save();
        return reply.code(200).send(new ApiResponse(200, cart, "Cart item updated"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while updating cart item"));
    }
};

// 4. Remove Cart Item
const removeCartItem = async (request, reply) => {
    try {
        const { user_id, product_id } = request.body;
        if (!user_id || !product_id) {
            return reply.code(400).send(new ApiResponse(400, {}, "user_id and product_id are required"));
        }
        const cart = await Cart.findOne({ user_id });
        if (!cart) {
            return reply.code(404).send(new ApiResponse(404, {}, "Cart not found"));
        }
        cart.items = cart.items.filter(item => item.product_id.toString() !== product_id);
        await cart.save();
        return reply.code(200).send(new ApiResponse(200, cart, "Item removed from cart"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while removing cart item"));
    }
};

// 5. Clear Cart
const clearCart = async (request, reply) => {
    try {
        const { user_id } = request.body;
        if (!user_id) {
            return reply.code(400).send(new ApiResponse(400, {}, "user_id is required"));
        }
        const cart = await Cart.findOne({ user_id });
        if (!cart) {
            return reply.code(404).send(new ApiResponse(404, {}, "Cart not found"));
        }
        cart.items = [];
        await cart.save();
        return reply.code(200).send(new ApiResponse(200, cart, "Cart cleared"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while clearing cart"));
    }
};

export {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
}; 