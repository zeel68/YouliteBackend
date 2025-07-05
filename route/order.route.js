import { createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder, updateOrderStatus } from "../controller/order.controller.js";

export default async function orderRoutes(fastify, opts, done) {
    // Create Order
    fastify.post("/orders", createOrder);

    // Get All Orders (optionally by store/user)
    fastify.get("/orders", getAllOrders);

    // Get Order by ID
    fastify.get("/orders/:orderId", getOrderById);

    // Update Order
    fastify.put("/orders/:orderId", updateOrder);

    // Delete Order
    fastify.delete("/orders/:orderId", deleteOrder);

    // Update Order Status
    fastify.patch("/orders/:orderId/status", updateOrderStatus);

    done();
} 