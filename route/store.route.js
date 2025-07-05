// route/user.route.js
import { addStore, get_all_stores, get_hero_links, getStoreById, getStoreConfig } from '../controller/store.controller.js';
import { verifyJWT } from '../middelware/auth.middelware.js';

export default async function storeRouter(fastify, options) {

    fastify.get('/', get_all_stores)
    fastify.post('/addStore', addStore);
    fastify.post('/getHeroLinks', get_hero_links);
    fastify.get('/:id', getStoreById)
    fastify.get('/config/:id', getStoreConfig);
    // fastify.get('/getAllStores', get_all_stores);
    // fastify.get('/getStoreById/:id', get_store_by_id);
}

