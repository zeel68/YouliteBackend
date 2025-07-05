import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { HeroSection, TrendingCategory, TrendingProduct, Testimonial, HeroSlide } from "../model/homepage.model.js";


// HERO SECTION
const getHeroSection = async (request, reply) => {
    try {
        const { store_id } = request.query;
        const hero = await HeroSection.findOne({ store_id });
        return reply.code(200).send(new ApiResponse(200, hero, "Hero section fetched"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error fetching hero section"));
    }
};
const updateHeroSection = async (request, reply) => {
    try {
        const { store_id } = request.body;
        const updateData = request.body;
        const updated = await HeroSection.findOneAndUpdate({ store_id }, updateData, { new: true, upsert: true });
        return reply.code(200).send(new ApiResponse(200, updated, "Hero section updated"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error updating hero section"));
    }
};

// TRENDING CATEGORY
const getTrendingCategories = async (request, reply) => {
    try {
        const { store_id } = request.query;
        const categories = await TrendingCategory.find({ store_id }).populate("category_id").sort({ display_order: 1 });
        return reply.code(200).send(new ApiResponse(200, categories, "Trending categories fetched"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error fetching trending categories"));
    }
};
const updateTrendingCategories = async (request, reply) => {
    try {
        const { store_id, categories } = request.body; // categories: [{category_id, display_order}]
        await TrendingCategory.deleteMany({ store_id });
        const created = await TrendingCategory.insertMany(categories.map(c => ({ ...c, store_id })));
        return reply.code(200).send(new ApiResponse(200, created, "Trending categories updated"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error updating trending categories"));
    }
};

// TRENDING PRODUCT
const getTrendingProducts = async (request, reply) => {
    try {
        const { store_id } = request.query;
        const products = await TrendingProduct.find({ store_id }).populate("product_id").sort({ display_order: 1 });
        return reply.code(200).send(new ApiResponse(200, products, "Trending products fetched"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error fetching trending products"));
    }
};
const updateTrendingProducts = async (request, reply) => {
    try {
        const { store_id, products } = request.body; // products: [{product_id, display_order}]
        await TrendingProduct.deleteMany({ store_id });
        const created = await TrendingProduct.insertMany(products.map(p => ({ ...p, store_id })));
        return reply.code(200).send(new ApiResponse(200, created, "Trending products updated"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error updating trending products"));
    }
};

// TESTIMONIALS
const getTestimonials = async (request, reply) => {
    try {
        const { store_id } = request.query;
        const testimonials = await Testimonial.find({ store_id });
        return reply.code(200).send(new ApiResponse(200, testimonials, "Testimonials fetched"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error fetching testimonials"));
    }
};
const addTestimonial = async (request, reply) => {
    try {
        const data = request.body;
        const testimonial = await Testimonial.create(data);
        return reply.code(201).send(new ApiResponse(201, testimonial, "Testimonial added"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error adding testimonial"));
    }
};
const deleteTestimonial = async (request, reply) => {
    try {
        const { testimonialId } = request.params;
        await Testimonial.findByIdAndDelete(testimonialId);
        return reply.code(200).send(new ApiResponse(200, {}, "Testimonial deleted"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error deleting testimonial"));
    }
};

// HERO SLIDES
const getHeroSlides = async (request, reply) => {
    try {
        const { store_id } = request.query;
        const slides = await HeroSlide.find({ store_id, is_active: true }).sort({ display_order: 1 });
        return reply.code(200).send(new ApiResponse(200, slides, "Hero slides fetched"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error fetching hero slides"));
    }
};
const updateHeroSlides = async (request, reply) => {
    try {
        const { store_id, slides } = request.body; // slides: [{image_url, title, subtitle, link, display_order, is_active}]
        await HeroSlide.deleteMany({ store_id });
        const created = await HeroSlide.insertMany(slides.map(s => ({ ...s, store_id })));
        return reply.code(200).send(new ApiResponse(200, created, "Hero slides updated"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error updating hero slides"));
    }
};

// Get full homepage config for a store
const getHomepageConfig = async (request, reply) => {
    try {
        const { store_id } = request.query;
        const store = await Store.findById(store_id).select("config");
        return reply.code(200).send(new ApiResponse(200, store?.config || {}, "Homepage config fetched"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error fetching homepage config"));
    }
};

// Update homepage config (replace or patch)
const updateHomepageConfig = async (request, reply) => {
    try {
        const { store_id, config } = request.body;
        if (!store_id || !config) {
            return reply.code(400).send(new ApiResponse(400, {}, "store_id and config are required"));
        }
        const store = await Store.findByIdAndUpdate(
            store_id,
            { $set: { config } },
            { new: true }
        ).select("config");
        return reply.code(200).send(new ApiResponse(200, store.config, "Homepage config updated"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error updating homepage config"));
    }
};

// Patch a specific section (e.g., heroSection, trendingProducts, etc.)
const patchHomepageSection = async (request, reply) => {
    try {
        const { store_id, section, data } = request.body;
        if (!store_id || !section || data === undefined) {
            return reply.code(400).send(new ApiResponse(400, {}, "store_id, section, and data are required"));
        }
        const update = {};
        update[`config.${section}`] = data;
        const store = await Store.findByIdAndUpdate(
            store_id,
            { $set: update },
            { new: true }
        ).select("config");
        return reply.code(200).send(new ApiResponse(200, store.config, `Homepage section '${section}' updated`));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error updating homepage section"));
    }
};

export {
    getHeroSection,
    updateHeroSection,
    getTrendingCategories,
    updateTrendingCategories,
    getTrendingProducts,
    updateTrendingProducts,
    getTestimonials,
    addTestimonial,
    deleteTestimonial,
    getHeroSlides,
    updateHeroSlides,
    getHomepageConfig,
    updateHomepageConfig,
    patchHomepageSection
};