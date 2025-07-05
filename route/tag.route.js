import { addTag, getAllTags, getTagById, updateTag, deleteTag } from "../controller/tag.controller.js";

export default async function tagRoutes(fastify, opts, done) {
    // Create Tag
    fastify.post("/tags", addTag);

    // Get All Tags (optionally by category)
    fastify.get("/tags", getAllTags);

    // Get Tag by ID
    fastify.get("/tags/:tagId", getTagById);

    // Update Tag
    fastify.put("/tags/:tagId", updateTag);

    // Delete Tag
    fastify.delete("/tags/:tagId", deleteTag);

    done();
} 