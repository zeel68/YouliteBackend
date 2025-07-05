import { User } from "../model/user.model.js";
import { Store } from "../model/store.Model.js";
import { Order } from "../model/order.Model.js";
import { Product } from "../model/product.Model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// 1. Get All Users
const getAllUsers = async (request, reply) => {
    try {
        const users = await User.find({});
        return reply.code(200).send(new ApiResponse(200, users, "Users fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching users"));
    }
};

// 2. Get All Stores
const getAllStores = async (request, reply) => {
    try {
        const stores = await Store.find({});
        return reply.code(200).send(new ApiResponse(200, stores, "Stores fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching stores"));
    }
};

// 3. Get All Orders
const getAllOrders = async (request, reply) => {
    try {
        const orders = await Order.find({});
        return reply.code(200).send(new ApiResponse(200, orders, "Orders fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching orders"));
    }
};

// 4. Get All Products
const getAllProducts = async (request, reply) => {
    try {
        const products = await Product.find({});
        return reply.code(200).send(new ApiResponse(200, products, "Products fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching products"));
    }
};

export {
    getAllUsers,
    getAllStores,
    getAllOrders,
    getAllProducts
}; 