import { Product } from "../model/product.Model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// 1. Add Product
const addProduct = async (request, reply) => {
    try {
        const { name, description, price, category, seller, attributes, stock, images, tags } = request.body;
        if (!name?.trim() || !price || !category) {
            return reply.code(400).send(new ApiResponse(400, {}, "Name, price, and category are required"));
        }
        const product = await Product.create({
            name,
            description,
            price,
            category,
            seller,
            attributes,
            stock,
            images,
            tags
        });
        return reply.code(201).send(new ApiResponse(201, product, "Product added successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while adding the product"));
    }
};

// 2. Get All Products (with optional filters)
const getAllProducts = async (request, reply) => {
    try {
        const { store_id, category, tags, minPrice, maxPrice, seller } = request.query;
        // let filter = {};
        // if (category) filter.category = category;
        // if (seller) filter.seller = seller;
        // if (tags) {
        //     // tags can be comma-separated
        //     filter.tags = { $all: tags.split(",") };
        // }
        // if (minPrice || maxPrice) {
        //     filter.price = {};
        //     if (minPrice) filter.price.$gte = Number(minPrice);
        //     if (maxPrice) filter.price.$lte = Number(maxPrice);
        // }
        const products = await Product.find({ store_id: store_id });
        return reply.code(200).send(new ApiResponse(200, products, "Products fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching products"));
    }
};

// 3. Get Product by ID
const getProductById = async (request, reply) => {
    try {
        const { productId } = request.params;
        const product = await Product.findById(productId).populate("category").populate("seller", "name email");
        if (!product) {
            return reply.code(404).send(new ApiResponse(404, {}, "Product not found"));
        }
        return reply.code(200).send(new ApiResponse(200, product, "Product fetched successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while fetching the product"));
    }
};

// 4. Update Product
const updateProduct = async (request, reply) => {
    try {
        const { productId } = request.params;
        const updateData = request.body;
        const updated = await Product.findByIdAndUpdate(productId, updateData, { new: true });
        if (!updated) {
            return reply.code(404).send(new ApiResponse(404, {}, "Product not found"));
        }
        return reply.code(200).send(new ApiResponse(200, updated, "Product updated successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while updating the product"));
    }
};

// 5. Delete Product
const deleteProduct = async (request, reply) => {
    try {
        const { productId } = request.params;
        const deleted = await Product.findByIdAndDelete(productId);
        if (!deleted) {
            return reply.code(404).send(new ApiResponse(404, {}, "Product not found"));
        }
        return reply.code(200).send(new ApiResponse(200, {}, "Product deleted successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while deleting the product"));
    }
};

// 6. Search/Filter Products (advanced)
const searchProducts = async (request, reply) => {
    try {
        const { q, category, tags, minPrice, maxPrice, sortBy, sortOrder } = request.query;
        let filter = {};
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ];
        }
        if (category) filter.category = category;
        if (tags) filter.tags = { $all: tags.split(",") };
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        let sort = {};
        if (sortBy) sort[sortBy] = sortOrder === "desc" ? -1 : 1;
        const products = await Product.find(filter).sort(sort).populate("category").populate("seller", "name email");
        return reply.code(200).send(new ApiResponse(200, products, "Products filtered successfully"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Something went wrong while searching products"));
    }
};

export {
    addProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts
}; 