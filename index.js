// server.js
import Fastify from 'fastify';
import dotenv from 'dotenv';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './db/connection.js';
import userRouter from './route/user.route.js';
import roleRoutes from './route/role.route.js';
import categoryRoutes from './route/category.route.js';
import storeRouter from './route/store.route.js';
import homepageRouter from './route/homepage.route.js';
import productRoutes from './route/product.route.js';
import multipart from '@fastify/multipart';
import multer from 'fastify-multer';
import axios from 'axios';
import fs from "fs";
dotenv.config({ path: './.env' });


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true
});

// Register CORS
await fastify.register(cors);

// Register cookie parser
await fastify.register(cookie);

// Parse JSON and URL-encoded (Fastify handles JSON by default)
fastify.addContentTypeParser('application/x-www-form-urlencoded', { parseAs: 'string' }, fastify.getDefaultJsonParser('ignore', 'ignore'));

// await fastify.register(multer.contentParser);

fastify.register(multipart);
// Declare a test route
fastify.get('/', async (request, reply) => {
  return { message: 'Hello world' };
});






// Register user routes
await fastify.register(userRouter, { prefix: '/api/v1/users' });
await fastify.register(roleRoutes, { prefix: '/api/v1/role' });
await fastify.register(categoryRoutes, { prefix: '/api/v1/categories' });
await fastify.register(storeRouter, { prefix: '/api/v1/stores' });
await fastify.register(productRoutes, { prefix: "/api/v1/products" })
// await fastify.register(homepageRouter, { prefix: '/api/v1/homepage' });
// Connect DB and start server
try {
  await connectDB();
  await fastify.listen({ port: process.env.PORT || 8000, host: '0.0.0.0' });
  console.log(`⚙️ Server running on port ${process.env.PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
