import { Tag } from "../model/tag.Model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// 1. Add Tag
const addTag = async (request, reply) => {
    try {
        const { name, category_id } = request.body;
        if (!name?.trim() || !category_id) {
            return reply.code(400).send(new ApiResponse(400, {}, "Tag name and category_id are required"));
        }
        const tag = await Tag.create({ name, category_id });
        return reply.code(201).send(new ApiResponse(201, tag, "Tag added successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while adding the tag"));
    }
};

// 2. Get All Tags (optionally by category)
const getAllTags = async (request, reply) => {
    try {
        const { category_id } = request.query;
        let filter = {};
        if (category_id) filter.category_id = category_id;
        const tags = await Tag.find(filter);
        return reply.code(200).send(new ApiResponse(200, tags, "Tags fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching tags"));
    }
};

// 3. Get Tag by ID
const getTagById = async (request, reply) => {
    try {
        const { tagId } = request.params;
        const tag = await Tag.findById(tagId);
        if (!tag) {
            return reply.code(404).send(new ApiResponse(404, {}, "Tag not found"));
        }
        return reply.code(200).send(new ApiResponse(200, tag, "Tag fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching the tag"));
    }
};

// 4. Update Tag
const updateTag = async (request, reply) => {
    try {
        const { tagId } = request.params;
        const updateData = request.body;
        const updated = await Tag.findByIdAndUpdate(tagId, updateData, { new: true });
        if (!updated) {
            return reply.code(404).send(new ApiResponse(404, {}, "Tag not found"));
        }
        return reply.code(200).send(new ApiResponse(200, updated, "Tag updated successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while updating the tag"));
    }
};

// 5. Delete Tag
const deleteTag = async (request, reply) => {
    try {
        const { tagId } = request.params;
        const deleted = await Tag.findByIdAndDelete(tagId);
        if (!deleted) {
            return reply.code(404).send(new ApiResponse(404, {}, "Tag not found"));
        }
        return reply.code(200).send(new ApiResponse(200, {}, "Tag deleted successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while deleting the tag"));
    }
};

export {
    addTag,
    getAllTags,
    getTagById,
    updateTag,
    deleteTag
}; 