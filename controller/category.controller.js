import { Category } from "../model/category.Model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// 1. Add Category
const addCategory = async (request, reply) => {
    const { category_name, img_url } = request.body;

    if (!category_name?.trim()) {
        return reply.code(400).send(new ApiResponse(400, {}, "Category name is required"));
    }

    try {
        const category = await Category.create({
            name: category_name,
            image_url: img_url || "",
            attribute_schema: {}
        });

        return reply.code(201).send(new ApiResponse(201, category, "Category added successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while adding the category"));
    }
};

// 2. Get All Categories
const getAllCategories = async (request, reply) => {
    try {
        const categories = await Category.find({});
        if (!categories.length) {
            return reply.code(404).send(new ApiResponse(404, [], "No categories found"));
        }
        return reply.code(200).send(new ApiResponse(200, categories, "Categories fetched successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching categories"));
    }
};

// 3. Get Category by ID
const getCategoryById = async (request, reply) => {
    const { category_id } = request.params;

    try {
        const category = await Category.findById(category_id)
            .populate("stores")
        // .populate("tags");
        if (!category) {
            return reply.code(404).send(new ApiResponse(404, {}, "Category not found"));
        }
        return reply.code(200).send(new ApiResponse(200, category, "Category fetched successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching the category"));
    }
};

// 4. Update Category
const updateCategory = async (request, reply) => {
    const { category_id } = request.params;
    const { category_name, img_url, attribute_schema } = request.body;

    try {
        const updated = await Category.findByIdAndUpdate(
            category_id,
            {
                ...(category_name && { name: category_name }),
                ...(img_url && { image_url: img_url }),
                ...(attribute_schema && { attribute_schema }),
                updated_at: Date.now()
            },
            { new: true }
        );

        if (!updated) {
            return reply.code(404).send(new ApiResponse(404, {}, "Category not found"));
        }

        return reply.code(200).send(new ApiResponse(200, updated, "Category updated successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while updating the category"));
    }
};

// 5. Delete Category
const deleteCategory = async (request, reply) => {
    const { category_id } = request.params;
    try {
        const deleted = await Category.findByIdAndDelete(category_id);
        if (!deleted) {
            return reply.code(404).send(new ApiResponse(404, {}, "Category not found"));
        }
        return reply.code(200).send(new ApiResponse(200, {}, "Category deleted successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while deleting the category"));
    }
};

// 6. Get Stores Count for Category
const getStoresCount = async (request, reply) => {
    const { category_id } = request.params;
    try {
        const category = await Category.findById(category_id).populate("stores_count");
        if (!category) {
            return reply.code(404).send(new ApiResponse(404, {}, "Category not found"));
        }
        return reply.code(200).send(new ApiResponse(200, category.stores_count, "Stores count fetched successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Failed to get store count"));
    }
};

// 7. Get Tags Count for Category
const getTagsCount = async (request, reply) => {
    const { category_id } = request.params;
    try {
        const category = await Category.findById(category_id).populate("tags_count");
        if (!category) {
            return reply.code(404).send(new ApiResponse(404, {}, "Category not found"));
        }
        return reply.code(200).send(new ApiResponse(200, category.tags_count, "Tags count fetched successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Failed to get tag count"));
    }
};

// 8. Get All Stores of Category
const getStores = async (request, reply) => {
    const { category_id } = request.params;
    try {
        const category = await Category.findById(category_id).populate("stores");
        if (!category) {
            return reply.code(404).send(new ApiResponse(404, {}, "Category not found"));
        }
        return reply.code(200).send(new ApiResponse(200, category.stores, "Stores fetched successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Failed to get stores"));
    }
};

// 9. Get All Tags of Category
const getTags = async (request, reply) => {
    const { category_id } = request.params;
    try {
        const category = await Category.findById(category_id).populate("tags");
        if (!category) {
            return reply.code(404).send(new ApiResponse(404, {}, "Category not found"));
        }
        return reply.code(200).send(new ApiResponse(200, category.tags, "Tags fetched successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Failed to get tags"));
    }
};


// 10. Update only attribute_schema
const updateCategorySchema = async (request, reply) => {
    const { category_id } = request.params;
    const { attribute_schema } = request.body;

    if (!attribute_schema || typeof attribute_schema !== 'object') {
        return reply.code(400).send(new ApiResponse(400, {}, "Valid attribute_schema object is required"));
    }

    try {
        const updated = await Category.findByIdAndUpdate(
            category_id,
            { attribute_schema, updated_at: Date.now() },
            { new: true }
        );

        if (!updated) {
            return reply.code(404).send(new ApiResponse(404, {}, "Category not found"));
        }

        return reply.code(200).send(new ApiResponse(200, updated, "Attribute schema updated successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Failed to update attribute schema"));
    }
};

// 11. Search categories by name (case-insensitive)
const searchCategoriesByName = async (request, reply) => {
    const { name } = request.query;

    if (!name?.trim()) {
        return reply.code(400).send(new ApiResponse(400, {}, "Search query is required"));
    }

    try {
        const categories = await Category.find({
            name: { $regex: name, $options: "i" }
        });

        if (!categories.length) {
            return reply.code(404).send(new ApiResponse(404, [], "No categories matched your search"));
        }

        return reply.code(200).send(new ApiResponse(200, categories, "Categories fetched successfully"));
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Failed to search categories"));
    }
};

export {
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

};

