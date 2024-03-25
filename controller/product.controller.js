import { Product } from '../model/product.Model';
import { ApiError } from '../utils/ApiError';



// Create a new product
const createProduct = asyncHandler(async (req, res, next) => {
    let { name, description, price, category, seller, images, attributes, stock, tags } = req.body;

    // Trim white spaces from input fields
    name = name.trim();
    description = description.trim();
    category = category.trim();
    seller = seller.trim();

    // Validate request for null values and blank spaces
    if (!name || !description || !price || !category || !seller) {
        throw new ApiError(400, 'Name, description, price, category, and seller are required fields');
    }

    try {
        const product = new Product({
            name,
            description,
            price,
            category,
            seller,
            images,
            attributes,
            stock,
            tags
        });
        await product.save();
        res.status(201).json(new ApiResponse(201, product, 'Product created successfully'));
    } catch (error) {
        throw new ApiError(401, error);
    }
});

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Get a single product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Update a product by ID
const updateProductById = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

// Delete a product by ID
const deleteProductById = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById
};
