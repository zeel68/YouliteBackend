

// src/routes/product.routes.js

import { getAllProducts, addProduct } from '../controller/product.controller.js';
export default async function productRoutes(fastify, opts) {
    fastify.post('/', getAllProducts); // Public per store
    // fastify.get('/products/:store_id/:product_id', ProductController.getProductById); // Public

    // fastify.post('/products', { preHandler: [verifyJWT, isStoreOwner] }, ProductController.create);
    // fastify.put('/products/:id', { preHandler: [verifyJWT, isStoreOwner] }, ProductController.update);
    // fastify.delete('/products/:id', { preHandler: [verifyJWT, isStoreOwner] }, ProductController.remove);
}
