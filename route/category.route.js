import { get } from 'mongoose';
import {
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getStoresCount,
    getTagsCount,
    getStores,
    getTags,
    updateCategorySchema,
    searchCategoriesByName,
} from '../controller/category.controller.js';

import { verifyJWT } from '../middelware/auth.middelware.js';

export default async function categoryRoutes(fastify, options) {
    // Create
    fastify.post('/addCategory', { preHandler: verifyJWT }, addCategory);

    // Read
    fastify.get('/', getAllCategories);
    fastify.get('/:category_id', getCategoryById);
    fastify.get('/:category_id/stores/count', getStoresCount);
    fastify.get('/:category_id/tags/count', getTagsCount);
    fastify.get('/:category_id/stores', getStores);
    fastify.get(':category_id/tags', getTags);
    fastify.get('/search', searchCategoriesByName);

    // Update
    fastify.put('/:category_id', { preHandler: verifyJWT }, updateCategory);
    fastify.patch('/:category_id/schema', { preHandler: verifyJWT }, updateCategorySchema);

    // Delete
    fastify.delete('/:category_id', { preHandler: verifyJWT }, deleteCategory);
}
