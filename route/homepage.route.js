import {
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
} from "../controller/homepage.controller.js";

import { verifyJWT } from '../middelware/auth.middelware.js';

export default async function homepageRoutes(fastify, opts, done) {
    // Hero Section
    fastify.get("/homepage/hero-section", getHeroSection);
    fastify.put("/homepage/hero-section", updateHeroSection);

    // Trending Categories
    fastify.get("/homepage/trending-categories", getTrendingCategories);
    fastify.put("/homepage/trending-categories", updateTrendingCategories);

    // Trending Products
    fastify.get("/homepage/trending-products", getTrendingProducts);
    fastify.put("/homepage/trending-products", updateTrendingProducts);

    // Testimonials
    fastify.get("/homepage/testimonials", getTestimonials);
    fastify.post("/homepage/testimonials", addTestimonial);
    fastify.delete("/homepage/testimonials/:testimonialId", deleteTestimonial);

    // Hero Slides
    fastify.get("/homepage/hero-slides", getHeroSlides);
    fastify.put("/homepage/hero-slides", updateHeroSlides);

    // Get full homepage config for a store
    fastify.get("/homepage/config", getHomepageConfig);
    // Replace the entire homepage config
    fastify.put("/homepage/config", updateHomepageConfig);
    // Patch a specific section of the homepage config
    fastify.patch("/homepage/config/section", patchHomepageSection);

    done();
}