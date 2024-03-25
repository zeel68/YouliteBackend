// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import {User} from "../model/user.model.js";
// import {process_params} from "express/lib/router/index.js";



// // User registration
// const registerUser = async (req, res) => {
//     const { username, email, password } = req.body;

//     try {
//         // Check if user already exists
//         let user = await User.findOne({ email });

//         if (user) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         // Create new user instance
//         user = new User({ username, email, password });

//         // Hash password
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(password, salt);

//         // Save user to database
//         await user.save();

//         // Generate JWT token
//         const payload = {
//             user: {
//                 id: user.id
//             }
//         };

//         jwt.sign(
//             payload,
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: 3600 }, // Token expires in 1 hour
//             (err, token) => {
//                 if (err) throw err;
//                 res.json({ token });
//             }
//         );
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server Error');
//     }
// };

// // User login
// const loginUser = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Check if user exists
//         let user = await User.findOne({ email });

//         if (!user) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//         }

//         // Validate password
//         const isMatch = await bcrypt.compare(password, user.password);

//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//         }

//         // Generate JWT token
//         const payload = {
//             user: {
//                 id: user.id
//             }
//         };

//         jwt.sign(
//             payload,
//             config.jwtSecret,
//             { expiresIn: 3600 }, // Token expires in 1 hour
//             (err, token) => {
//                 if (err) throw err;
//                 res.json({ token });
//             }
//         );
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server Error');
//     }
// };

// // Update user profile
// const updateUserProfile = async (req, res) => {
//     const { firstName, lastName, email } = req.body;

//     try {
//         // Find user by ID
//         let user = await User.findById(req.user.id);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Update user profile
//         user.firstName = firstName;
//         user.lastName = lastName;
//         user.email = email;

//         // Save updated user profile
//         await user.save();

//         res.json(user);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server Error');
//     }
// };

// // Add new address for user
// const addAddress = async (req, res) => {
//     const { street, city, state, postalCode, country, phoneNumber, isDefault } = req.body;

//     try {
//         // Find user by ID
//         let user = await User.findById(req.user.id);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Create new address object
//         const newAddress = {
//             street,
//             city,
//             state,
//             postalCode,
//             country,
//             phoneNumber,
//             isDefault
//         };

//         // Add new address to user's addresses array
//         user.addresses.push(newAddress);

//         // Save updated user profile with new address
//         await user.save();

//         res.json(user.addresses);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server Error');
//     }
// };

// // Add new payment method for user
// const addPaymentMethod = async (req, res) => {
//     const { type, cardHolderName, cardNumber, expirationDate, cvv, billingAddress } = req.body;

//     try {
//         // Find user by ID
//         let user = await User.findById(req.user.id);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Create new payment method object
//         const newPaymentMethod = {
//             type,
//             cardHolderName,
//             cardNumber,
//             expirationDate,
//             cvv,
//             billingAddress
//         };

//         // Add new payment method to user's paymentMethods array
//         user.paymentMethods.push(newPaymentMethod);

//         // Save updated user profile with new payment method
//         await user.save();

//         res.json(user.paymentMethods);
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Server Error');
//     }
// };

// module.exports = {
//     registerUser,
//     loginUser,
//     updateUserProfile,
//     addAddress,
//     addPaymentMethod
// };
