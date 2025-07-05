import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../model/user.model.js";


export async function verifyJWT(request, reply) {
    const token =
        request.cookies?.accessToken ||
        request.headers.authorization?.replace('Bearer ', '')

    if (!token) {
        return reply.code(401).send({
            success: false,
            message: 'Access Token is required',
        })
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select('-password -refreshToken')

        if (!user) {
            return reply.code(401).send({
                success: false,
                message: 'Invalid Access Token',
            })
        }

        request.user = user
    } catch (error) {
        return reply.code(401).send({
            success: false,
            message: error?.message || 'Invalid access token',
        })
    }
}


// 🛡️ Require Login Middleware
export const requireUser = async (request, reply) => {
    if (!request.user) {
        return reply.code(401).send({ success: false, message: "User authentication required" });
    }
};

// 👑 Super Admin Middleware
export const isSuperAdmin = async (request, reply) => {
    if (!request.user || request.user.role_name !== "superadmin") {
        return reply.code(403).send({ success: false, message: "Super admin access required" });
    }
};

// 🏬 Store Owner Middleware
export const isStoreOwner = async (request, reply) => {
    if (!request.user || request.user.role_name !== "storeowner") {
        return reply.code(403).send({ success: false, message: "Store owner access required" });
    }
};

// 🛒 Customer Middleware
export const isCustomer = async (request, reply) => {
    if (!request.user || request.user.role_name !== "customer") {
        return reply.code(403).send({ success: false, message: "Customer access required" });
    }
};