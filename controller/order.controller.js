import { Order } from "../model/order.Model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// 1. Create Order
const createOrder = async (request, reply) => {
    try {
        const orderData = request.body;
        const order = await Order.create(orderData);
        return reply.code(201).send(new ApiResponse(201, order, "Order created successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while creating the order"));
    }
};

// 2. Get All Orders (optionally by store/user)
const getAllOrders = async (request, reply) => {
    try {
        const { store_id, user_id, status } = request.query;
        let filter = {};
        if (store_id) filter.store_id = store_id;
        if (user_id) filter.user_id = user_id;
        if (status) filter.status = status;
        const orders = await Order.find(filter).populate("user_id", "name email").populate("store_id", "name domain");
        return reply.code(200).send(new ApiResponse(200, orders, "Orders fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching orders"));
    }
};

// 3. Get Order by ID
const getOrderById = async (request, reply) => {
    try {
        const { orderId } = request.params;
        const order = await Order.findById(orderId).populate("user_id", "name email").populate("store_id", "name domain");
        if (!order) {
            return reply.code(404).send(new ApiResponse(404, {}, "Order not found"));
        }
        return reply.code(200).send(new ApiResponse(200, order, "Order fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching the order"));
    }
};

// 4. Update Order
const updateOrder = async (request, reply) => {
    try {
        const { orderId } = request.params;
        const updateData = request.body;
        const updated = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
        if (!updated) {
            return reply.code(404).send(new ApiResponse(404, {}, "Order not found"));
        }
        return reply.code(200).send(new ApiResponse(200, updated, "Order updated successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while updating the order"));
    }
};

// 5. Delete Order
const deleteOrder = async (request, reply) => {
    try {
        const { orderId } = request.params;
        const deleted = await Order.findByIdAndDelete(orderId);
        if (!deleted) {
            return reply.code(404).send(new ApiResponse(404, {}, "Order not found"));
        }
        return reply.code(200).send(new ApiResponse(200, {}, "Order deleted successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while deleting the order"));
    }
};

// 6. Update Order Status
const updateOrderStatus = async (request, reply) => {
    try {
        const { orderId } = request.params;
        const { status } = request.body;
        if (!status) {
            return reply.code(400).send(new ApiResponse(400, {}, "Status is required"));
        }
        const updated = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!updated) {
            return reply.code(404).send(new ApiResponse(404, {}, "Order not found"));
        }
        return reply.code(200).send(new ApiResponse(200, updated, "Order status updated successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while updating order status"));
    }
};

export {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    updateOrderStatus
}; 