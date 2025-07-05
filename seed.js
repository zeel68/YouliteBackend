import mongoose from "mongoose";
import { Category } from "./model/category.Model.js";
import { Store } from "./model/store.Model.js";
import { User } from "./model/user.model.js";
import { Product } from "./model/product.Model.js";
import { Tag } from "./model/tag.Model.js";
import { Order } from "./model/order.Model.js";
import { Payment } from "./model/payment.Model.js";
import { Cart } from "./model/cart.Model.js";
import { Role } from "./model/role.Model.js";
// import { Review } from "./model/review.Model.js"; // Uncomment if you have a Review model

const MONGO_URI = "mongodb://zesh:zesh6824@65.1.3.198:27017/WebBizz?authSource=admin" // Change to your DB

function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
    await mongoose.connect(MONGO_URI);

    // Clean existing data
    await Promise.all([
        Category.deleteMany({}),
        Store.deleteMany({}),
        User.deleteMany({}),
        Product.deleteMany({}),
        Tag.deleteMany({}),
        Order.deleteMany({}),
        Payment.deleteMany({}),
        Cart.deleteMany({}),
        Role.deleteMany({}),
        ProductCategory.deleteMany({}),
        // Review.deleteMany({}),
    ]);

    // 1. Roles
    const roleNames = ["admin", "customer", "seller", "manager", "support"];
    const roles = await Role.insertMany(roleNames.map(name => ({ name })));
    const storeCategory = ["Fashion", "Jewellery", "Toys", "Home Decor", "Electronics", "Books", "Sports", "Beauty", "Automotive", "Health", "Grocery"];
    // 2. Categories
    const categoryNames = [
        "Sarees", "Kurtis", "Lehenga", "Jewellery", "Toys", "Fashion", "Shoes", "Bags", "Watches", "Home Decor"
    ];
    const categories = await Category.insertMany(storeCategory.map((name, i) => ({ name, image_url: `${name.toLowerCase()}.jpg` })));


    // 3. Tags
    const tagNames = ["Cotton", "Silk", "Printed", "Gold", "Silver", "Kids", "Trendy", "Classic", "Handmade", "Designer", "Eco", "Luxury", "Budget", "Gift", "Ethnic", "Modern", "Party", "Casual", "Formal", "Limited"];
    let tags = [];
    for (let i = 0; i < tagNames.length; i++) {
        tags.push({ name: tagNames[i], category_id: randomFromArray(categories)._id });
    }
    tags = await Tag.insertMany(tags);

    //4. Stores
    let stores = [];
    for (let i = 1; i <= 10; i++) {
        stores.push({
            name: `Demo Store ${i}`,
            domain: `demo${i}.com`,
            category_id: randomFromArray(categories)._id,
            config: {
                heroSection: { image_url: `hero${i}.jpg`, title: `Welcome to Demo Store ${i}` },
                trendingCategories: [randomFromArray(categories)._id, randomFromArray(categories)._id],
                trendingProducts: [],
                testimonials: [],
                heroSlides: []
            },
            is_active: true
        });
    }
    stores = await Store.insertMany(stores);


    // 5. Users
    let users = [];
    for (let i = 1; i <= 20; i++) {
        users.push({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            phone_number: `100000000${i}`.slice(-10),
            password: "password",
            store_id: randomFromArray(stores)._id,
            role_id: randomFromArray(roles)._id
        });
    }
    users = await User.insertMany(users);

    // 6. Products
    let products = [];
    for (let i = 1; i <= 30; i++) {
        const cat = randomFromArray(categories);
        const seller = randomFromArray(users.filter(u => String(u.role_id) === String(roles.find(r => r.name === "seller")._id)));
        const prodTags = [randomFromArray(tags).name, randomFromArray(tags).name];
        products.push({
            name: `Product ${i}`,
            price: randomInt(100, 5000),
            category: cat._id,
            seller: seller ? seller._id : randomFromArray(users)._id,
            stock: { quantity: randomInt(1, 50) },
            tags: prodTags,
            images: [`product${i}.jpg`]
        });
    }
    products = await Product.insertMany(products);

    // 7. Orders
    let orders = [];
    for (let i = 1; i <= 15; i++) {
        const store = randomFromArray(stores);
        const user = randomFromArray(users);
        const orderProducts = [randomFromArray(products), randomFromArray(products)];
        const items = orderProducts.map(p => ({ product_id: p._id, quantity: randomInt(1, 3), price: p.price }));
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        orders.push({
            store_id: store._id,
            user_id: user._id,
            order_number: `ORD${1000 + i}`,
            total,
            product_name: `Product ${i}`,
            status: randomFromArray(["pending", "processing", "shipped", "delivered", "cancelled"]),
            shipping_address: {
                street: `${i} Main St`,
                city: "City",
                state: "State",
                country: "Country",
                postal_code: `1000${i}`,
                phone: user.phone_number
            },
            items
        });
    }
    orders = await Order.insertMany(orders);

    // 8. Payments
    let payments = [];
    for (let i = 0; i < orders.length - 1; i++) {
        console.log(orders[i].user_id);
        console.log(orders[i]._id)
        if (orders[i].user_id != null && orders[i]._id != null) {
            payments.push({
                user_id: orders[i].user_id,
                order_id: orders[i]._id,
                amount: orders[i].total,
                status: randomFromArray(["pending", "paid", "failed", "refunded"])
            });
        }
    }
    await Payment.insertMany(payments);

    // 9. Carts
    // let carts = [];
    // for (let i = 0; i < users.length; i++) {
    //     const cartItems = [];
    //     for (let j = 0; j < randomInt(1, 4); j++) {
    //         cartItems.push({ product_id: randomFromArray(products)._id, quantity: randomInt(1, 3) });
    //     }
    //     carts.push({ user_id: users[i]._id, items: cartItems });
    // }
    // await Cart.insertMany(carts);

    //10.(Optional) Reviews - Uncomment if you have a Review model
    // let reviews = [];
    // for (let i = 0; i < 30; i++) {
    //     reviews.push({
    //         product_id: randomFromArray(products)._id,
    //         user_id: randomFromArray(users)._id,
    //         rating: randomInt(1, 5),
    //         comment: `Review ${i + 1}`
    //     });
    // }
    // await Review.insertMany(reviews);

    console.log("Full complex seed data inserted!");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
}); 