// route/user.route.js
import { addRole, getAllRoles, getRoleById } from '../controller/role.controller.js';
import { verifyJWT } from '../middelware/auth.middelware.js';

export default async function roleRoutes(fastify, options) {

    fastify.post('/addRole', addRole);
    fastify.post('/getAllRoles', getAllRoles);
    fastify.post('/getRoleById', { preHandler: verifyJWT }, getRoleById);


}
