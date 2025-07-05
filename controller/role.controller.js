import { ApiError } from "../utils/ApiError.js";
import { Role } from "../model/role.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const addRole = async (request, reply) => {
    const { role_name } = request.body;
    if (!role_name?.trim()) {
        return reply.code(400).send(new ApiResponse(400, {}, "Role name is required"));
    }
    try {
        const role = await Role.create({ name: role_name });
        return reply.code(201).send(new ApiResponse(201, role, "Role added successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while adding the role"));
    }
}

const getAllRoles = async (request, reply) => {
    const roles = await Role.find({});
    if (!roles || roles.length === 0) {
        return { status: 404, message: "No roles found" };
    }
    return reply.code(200).send(new ApiResponse(200, roles, "Roles fetched successfully"));
}

const getRoleById = () => {

}
export {
    addRole,
    getAllRoles,
    getRoleById
}

