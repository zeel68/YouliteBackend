import { createPayment, getPaymentById, getAllPayments, updatePaymentStatus } from "../controller/payment.controller.js";

export default async function paymentRoutes(fastify, opts, done) {
    // Create Payment
    fastify.post("/payments", createPayment);

    // Get Payment by ID
    fastify.get("/payments/:paymentId", getPaymentById);

    // Get All Payments (optionally by user/order)
    fastify.get("/payments", getAllPayments);

    // Update Payment Status
    fastify.patch("/payments/:paymentId/status", updatePaymentStatus);

    done();
} 