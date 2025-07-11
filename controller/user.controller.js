import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { Role } from "../model/role.model.js";
import Jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";


// 🔐 Generate Tokens
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

// 📝 Register User
const registerUser = async (request, reply) => {
  try {
    const { email, username, name, phone_number, password, role_id, store_id } = request.body;

    if (!username?.trim() || !password?.trim() || !email?.trim(), !name?.trim(), !store_id) {
      return reply.code(400).send(new ApiResponse(400, {}, "All fields are required"));
    }

    const existedUser = await User.findOne({ $or: [{ phone_number }, { email }] });

    if (existedUser) {
      return reply.code(409).send(
        new ApiResponse(409, {}, "Username or email already exists")
      );
    }

    const user = await User.create({
      phone_number,
      email,
      password,
      name: username,
      store_id,
      role_id,
      phone_number
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }

    return reply.code(201).send(
      new ApiResponse(200, createdUser, "User registered successfully")
    );
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send(new ApiResponse(500, {}, err.message));
  }
};

// 🔓 Login User
const loginUser = async (request, reply) => {
  try {
    const { email, phone_number, password } = request.body;

    if (!phone_number && !email) {
      return reply.code(400).send(
        new ApiResponse(400, {}, "Username or email is required")
      );
    }

    const user = await User.findOne({
      $or: [{ phone_number }, { email }]
    }).select("+password");

    if (!user) {
      return reply.code(404).send(new ApiResponse(404, {}, "User not found"));
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return reply.code(401).send(new ApiResponse(401, {}, "Invalid password"));
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
    const { _id, name, email: userEmail } = user;
    console.log("role id", user.role_id);

    const roleName = await Role.findById(user.role_id).select("name")
    console.log(roleName);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      path: "/"
    };

    reply
      .setCookie("accessToken", accessToken, cookieOptions)
      .setCookie("refreshToken", refreshToken, cookieOptions)
      .code(200)
      .send(
        new ApiResponse(
          200,
          {
            user: {
              _id,
              name,
              email: userEmail,
              phone_number: user.phone_number,
              role: roleName.name,
              store_id: user.store_id,
              phone_number: user.phone_number,
              profile_url: user.profile_url

            },
            accessToken,
            refreshToken
          },
          "User logged in successfully"
        )
      );
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send(new ApiResponse(500, {}, err.message));
  }
};

// 🚪 Logout
const logoutUser = async (request, reply) => {
  try {
    await User.findByIdAndUpdate(request.user._id, {
      $unset: { refreshToken: 1 }
    });

    const options = { httpOnly: true, secure: true, path: "/" };

    reply
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .code(200)
      .send(new ApiResponse(200, {}, "User logged out"));
  } catch (err) {
    request.log.error(err);
    reply.code(err.statusCode || 500).send(new ApiResponse(500, {}, err.message));
  }
};

// ♻️ Refresh Access Token
const refreshAccessToken = async (request, reply) => {
  try {
    const inComingRefreshToken =
      request.cookies.refreshToken || request.body.refreshToken || null;

    if (!inComingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = Jwt.verify(
      inComingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user || inComingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    const options = { httpOnly: true, secure: true, path: "/" };

    reply
      .setCookie("accessToken", accessToken, options)
      .setCookie("refreshToken", newRefreshToken, options)
      .code(200)
      .send(
        new ApiResponse(
          200,
          {
            user_id: user._id,
            accessToken,
            newRefreshToken
          },
          "Access token refreshed"
        )
      );
  } catch (err) {
    request.log.error(err);
    reply.code(err.statusCode || 500).send(new ApiResponse(500, {}, err.message));
  }
};


const updateUserInfo = async (request, reply) => {
  const { user_id } = request.body;
  if (!user_id) {
    throw new ApiError(400, "user_id can't be empty");
  }
};


const getUserProfile = async (request, reply) => {
  const { user_id } = request.params || request.body;
  if (!user_id) {
    throw new ApiError(400, "user_id can't be empty");
  }

  try {
    const user = await User.findById(user_id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return reply.code(200).send(new ApiResponse(200, user, "User profile fetched successfully"));
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send(new ApiResponse(500, {}, err.message));
  }
};
// 🛠 Utility: Get current store ID from request
const getCurrentStoreId = (request) => {
  if (!request.user || !request.user.store_id) {
    throw new ApiError(403, "Tenant context missing");
  }
  return request.user.store_id;
};

// 📦 Get Orders by User ID
const getOrdersByUserId = async (request, reply) => {
  try {
    const { user_id } = request.params;
    const storeId = getCurrentStoreId(request);

    if (!user_id) {
      throw new ApiError(400, "user_id is required");
    }

    const orders = await Order.find({
      user_id,
      store_id: storeId
    })
      .sort({ created_at: -1 })
      .populate('items.product_id', 'name price')
      .populate('items.variant_id', 'name price');

    return reply.code(200).send(
      new ApiResponse(200, orders, "Orders fetched successfully")
    );
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send(
      new ApiResponse(err.statusCode || 500, {}, err.message)
    );
  }
};

// 📬 Get Order by ID for User
const getOrderByUserId = async (request, reply) => {
  try {
    const { order_id } = request.params;
    const storeId = getCurrentStoreId(request);
    const userId = request.user._id;

    if (!order_id) {
      throw new ApiError(400, "order_id is required");
    }

    const order = await Order.findOne({
      _id: order_id,
      user_id: userId,
      store_id: storeId
    })
      .populate('items.product_id', 'name price image_url')
      .populate('items.variant_id', 'name price')
      .populate('store_details', 'name domain');

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return reply.code(200).send(
      new ApiResponse(200, order, "Order details fetched successfully")
    );
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send(
      new ApiResponse(err.statusCode || 500, {}, err.message)
    );
  }
};

// 🖼 Update User Profile
const updateUserProfile = async (request, reply) => {
  try {
    const userId = request.user._id;
    const storeId = getCurrentStoreId(request);
    const { profile_url } = request.body;

    if (!profile_url) {
      throw new ApiError(400, "profile_url is required");
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, store_id: storeId },
      { profile_url },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return reply.code(200).send(
      new ApiResponse(200, updatedUser, "Profile updated successfully")
    );
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send(
      new ApiResponse(err.statusCode || 500, {}, err.message)
    );
  }
};

// 🔒 Change User Password
const changeUserPassword = async (request, reply) => {
  try {
    const userId = request.user._id;
    const storeId = getCurrentStoreId(request);
    const { oldPassword, newPassword } = request.body;

    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Both old and new passwords are required");
    }

    const user = await User.findById(userId).select("+password");
    if (!user || !user.store_id.equals(storeId)) {
      throw new ApiError(404, "User not found in this store");
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid old password");
    }

    user.password = newPassword;
    await user.save();

    return reply.code(200).send(
      new ApiResponse(200, {}, "Password changed successfully")
    );
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send(
      new ApiResponse(err.statusCode || 500, {}, err.message)
    );
  }
};

// 🏠 Add User Address
const addUserAddress = async (request, reply) => {
  try {
    const userId = request.user._id;
    const storeId = getCurrentStoreId(request);
    const { address } = request.body;

    if (!address) {
      throw new ApiError(400, "Address is required");
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, store_id: storeId },
      { $set: { address } },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return reply.code(200).send(
      new ApiResponse(200, updatedUser, "Address added successfully")
    );
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send(
      new ApiResponse(err.statusCode || 500, {}, err.message)
    );
  }
};

// 🏠 Get User Addresses
const getUserAddresses = async (request, reply) => {
  try {
    const userId = request.user._id;
    const storeId = getCurrentStoreId(request);

    const user = await User.findOne(
      { _id: userId, store_id: storeId },
      'address'
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return reply.code(200).send(
      new ApiResponse(200, { address: user.address }, "Address fetched successfully")
    );
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send(
      new ApiResponse(err.statusCode || 500, {}, err.message)
    );
  }
};

// 🏠 Update User Address
const updateUserAddress = async (request, reply) => {
  try {
    const userId = request.user._id;
    const storeId = getCurrentStoreId(request);
    const { address } = request.body;

    if (!address) {
      throw new ApiError(400, "Address is required");
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, store_id: storeId },
      { address },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return reply.code(200).send(
      new ApiResponse(200, updatedUser, "Address updated successfully")
    );
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send(
      new ApiResponse(err.statusCode || 500, {}, err.message)
    );
  }
};

// 🗑 Delete User Address
const deleteUserAddress = async (request, reply) => {
  try {
    const userId = request.user._id;
    const storeId = getCurrentStoreId(request);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, store_id: storeId },
      { $unset: { address: "" } },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }

    return reply.code(200).send(
      new ApiResponse(200, updatedUser, "Address deleted successfully")
    );
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send(
      new ApiResponse(err.statusCode || 500, {}, err.message)
    );
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserInfo,
  getUserProfile,
  getOrdersByUserId,
  getOrderByUserId,
  updateUserProfile,
  changeUserPassword,
  addUserAddress,
  getUserAddresses,
  updateUserAddress,
  deleteUserAddress,
};
