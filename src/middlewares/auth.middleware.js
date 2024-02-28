import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiResolve.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ACCESS_TOKEN_SECRET } from "../constants.js";
import { User } from "../models/user.model.js";

const authenticate = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json(new ApiError(401, "Unauthorized access"));
    const userData = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(userData._id);
    if (!user) return res.status(401).json(new ApiError(401, "Invalid token"));
    req.body.user = user;
    next();
  } catch (error) {
    console.log("Authenticate error!! ", error);
    return res.status(401).json(new ApiError(401, "Unauthorized access"));
  }
});

export { authenticate };
