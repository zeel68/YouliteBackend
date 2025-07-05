import { Payment } from "../model/payment.Model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// 1. Create Payment
const createPayment = async (request, reply) => {
    try {
        const paymentData = request.body;
        const payment = await Payment.create(paymentData);
        return reply.code(201).send(new ApiResponse(201, payment, "Payment created successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while creating the payment"));
    }
};

// 2. Get Payment by ID
const getPaymentById = async (request, reply) => {
    try {
        const { paymentId } = request.params;
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return reply.code(404).send(new ApiResponse(404, {}, "Payment not found"));
        }
        return reply.code(200).send(new ApiResponse(200, payment, "Payment fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching the payment"));
    }
};

// 3. Get All Payments (optionally by user/order)
const getAllPayments = async (request, reply) => {
    try {
        const { user_id, order_id } = request.query;
        let filter = {};
        if (user_id) filter.user_id = user_id;
        if (order_id) filter.order_id = order_id;
        const payments = await Payment.find(filter);
        return reply.code(200).send(new ApiResponse(200, payments, "Payments fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching payments"));
    }
};

// 4. Update Payment Status
const updatePaymentStatus = async (request, reply) => {
    try {
        const { paymentId } = request.params;
        const { status } = request.body;
        if (!status) {
            return reply.code(400).send(new ApiResponse(400, {}, "Status is required"));
        }
        const updated = await Payment.findByIdAndUpdate(paymentId, { status }, { new: true });
        if (!updated) {
            return reply.code(404).send(new ApiResponse(404, {}, "Payment not found"));
        }
        return reply.code(200).send(new ApiResponse(200, updated, "Payment status updated successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while updating payment status"));
    }
};

export {
    createPayment,
    getPaymentById,
    getAllPayments,
    updatePaymentStatus
}; 