import { Order } from "../model/order.Model.js";
import { User } from "../model/user.model.js";
import { Product } from "../model/product.Model.js";
import { Store } from "../model/store.Model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// 1. Total Sales (optionally by store/date)
const getTotalSales = async (request, reply) => {
    try {
        const { store_id, start, end } = request.query;
        let filter = {};
        if (store_id) filter.store_id = store_id;
        if (start || end) {
            filter.created_at = {};
            if (start) filter.created_at.$gte = new Date(start);
            if (end) filter.created_at.$lte = new Date(end);
        }
        const result = await Order.aggregate([
            { $match: filter },
            { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
        ]);
        return reply.code(200).send(new ApiResponse(200, result[0] || { total: 0, count: 0 }, "Total sales fetched"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error fetching total sales"));
    }
};

// 2. Sales Trend (grouped by day)
const getSalesTrend = async (request, reply) => {
    try {
        const { store_id, days = 30 } = request.query;
        let filter = {};
        if (store_id) filter.store_id = store_id;
        const since = new Date();
        since.setDate(since.getDate() - days);
        filter.created_at = { $gte: since };
        const result = await Order.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    total: { $sum: "$total" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        return reply.code(200).send(new ApiResponse(200, result, "Sales trend fetched"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error fetching sales trend"));
    }
};

// 3. Top Selling Products
const getTopProducts = async (request, reply) => {
    try {
        const { store_id, limit = 5 } = request.query;
        let match = {};
        if (store_id) match.store_id = store_id;
        const result = await Order.aggregate([
            { $match: match },
            { $unwind: "$items" },
            { $group: { _id: "$items.product_id", sold: { $sum: "$items.quantity" } } },
            { $sort: { sold: -1 } },
            { $limit: Number(limit) },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" }
        ]);
        return reply.code(200).send(new ApiResponse(200, result, "Top products fetched"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error fetching top products"));
    }
};

// 4. User Growth
const getUserGrowth = async (request, reply) => {
    try {
        const { days = 30 } = request.query;
        const since = new Date();
        since.setDate(since.getDate() - days);
        const result = await User.aggregate([
            { $match: { created_at: { $gte: since } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        return reply.code(200).send(new ApiResponse(200, result, "User growth fetched"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error fetching user growth"));
    }
};

// 5. Inventory Status
const getInventoryStatus = async (request, reply) => {
    try {
        const lowStock = await Product.find({ "stock.quantity": { $lte: 5, $gt: 0 } });
        const outOfStock = await Product.find({ "stock.quantity": { $lte: 0 } });
        return reply.code(200).send(new ApiResponse(200, { lowStock, outOfStock }, "Inventory status fetched"));
    } catch (error) {
        request.log?.error?.(error);
        return reply.code(500).send(new ApiResponse(500, {}, "Error fetching inventory status"));
    }
};

export {
    getTotalSales,
    getSalesTrend,
    getTopProducts,
    getUserGrowth,
    getInventoryStatus
}; 