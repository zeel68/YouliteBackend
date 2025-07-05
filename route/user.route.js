// route/user.route.js
import { loginUser, logoutUser, refreshAccessToken, registerUser, getUserProfile } from '../controller/user.controller.js';
import { verifyJWT } from '../middelware/auth.middelware.js';

export default async function userRoutes(fastify, options) {
    // POST /login
    fastify.post('/login', loginUser);

    // POST /register
    fastify.post('/register', registerUser);

    // POST /logout with JWT verification preHandler
    fastify.post('/logout', { preHandler: verifyJWT }, logoutUser);

    // POST /refreshToken
    fastify.post('/refreshToken', refreshAccessToken);

    fastify.get('/profile/:user_id', { preHandler: verifyJWT }, getUserProfile);
}
