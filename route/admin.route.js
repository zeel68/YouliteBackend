import { getAllUsers, getAllStores, getAllOrders, getAllProducts } from "../controller/admin.controller.js";

export default async function adminRoutes(fastify, opts, done) {
    // Get all users
    fastify.get("/admin/users", getAllUsers);

    // Get all stores
    fastify.get("/admin/stores", getAllStores);

    // Get all orders
    fastify.get("/admin/orders", getAllOrders);

    // Get all products
    fastify.get("/admin/products", getAllProducts);

    done();
} 