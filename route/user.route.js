import { Router } from "express";
import  {loginUser,logoutUser,refreshAccessToken,registerUser} from "../controller/user.controller.js"
import { verifyJWT } from "../middelware/auth.middelware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const userRouter = Router()
userRouter.route("/login").post(loginUser);
userRouter.route("/register").post(registerUser)
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("/refreshToken").post(refreshAccessToken)


export default userRouter