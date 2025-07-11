import { request } from "express";
import { Store } from "../model/store.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addStore = async (request, reply) => {
    const { store_name, domain, category_id, config } = request.body;

    if (!store_name?.trim() || !category_id?.trim()) {
        return reply.code(400).send(new ApiResponse(400, {}, "All fields are required"));
    }

    try {
        const store = await Store.create({
            name: store_name,
            domain,
            category_id,
            is_active: true,
            config
        });

        return reply.code(201).send(new ApiResponse(201, store, "Store added successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while adding the store"));
    }
}

const get_hero_links = async (request, reply) => {
    // This function fetch all the hero textLinks from the current store
    const { storeId } = request.body; // Assuming store_id is set in the request context

    try {
        const stores = await Store.find({ _id: storeId })
            .select("config -_id")

        if (!stores.length) {
            return reply.code(404).send(new ApiResponse(404, [], "No active stores found"));
        }

        return reply.code(200).send(new ApiResponse(200, stores[0].config.hero_top_links, "Hero text links fetched successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching active stores"));
    }
}

const get_all_stores = async (request, reply) => {
    try {
        const page = parseInt(request.query.page) || 1; // Default to page 1
        const limit = parseInt(request.query.limit) || 10; // Default to 10 items per page
        const skip = (page - 1) * limit;

        const [stores, total] = await Promise.all([
            Store.find({ is_active: true })
                .select("name domain category_id config _id")
                .populate("category_id", "name ")
                .skip(skip)
                .limit(limit),
            Store.countDocuments({ is_active: true }),
        ]);

        if (!stores.length) {
            return reply.code(404).send(new ApiResponse(404, [], "No active stores found"));
        }

        const totalPages = Math.ceil(total / limit);

        return reply.code(200).send(
            new ApiResponse(200, {
                data: stores,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                }
            }, "Active stores fetched successfully")
        );
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching active stores"));
    }
};


const getStoreById = async (request, reply) => {
    const { id } = request.params;

    try {
        const store = await Store.findById({ _id: id })
            .select("name domain category_id config _id")
            .populate("category_id", "name -_id");

        if (!store) {
            return reply.code(404).send(new ApiResponse(404, {}, "Store not found"));
        }

        return reply.code(200).send(new ApiResponse(200, store, "Store fetched successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching the store"));
    }
}

const getStoreConfig = async (request, reply) => {
    const { id } = request.params;
    try {
        const store = await Store.findById(id)
            .select("config -_id");

        if (!store) {
            return reply.code(404).send(new ApiResponse(404, {}, "Store not found"));
        }

        return reply.code(200).send(new ApiResponse(200, store.config, "Store config fetched successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching the store config"));
    }
}
export {
    addStore, get_hero_links, get_all_stores, getStoreById, getStoreConfig
}