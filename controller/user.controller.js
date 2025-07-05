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

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateUserInfo,
  getUserProfile
};
