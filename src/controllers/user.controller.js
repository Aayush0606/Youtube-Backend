import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/ApiResolve.js";
import { User } from "../models/user.model.js";
import { cloudinaryUpload } from "../utils/cloudinaryUpload.js";
import { REFRESH_TOKEN_SECRET } from "../constants.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, fullName, password } = req.body;
  const avatar = (req.files?.avatar && req.files?.avatar[0]?.path) || null;
  const coverImage =
    (req.files?.coverImage && req.files?.coverImage[0]?.path) || null;

  req.body.avatarLocalUrl = avatar;
  req.body.coverImageLocalUrl = coverImage;

  if (!avatar) {
    res.status(400).json(new ApiError(400, "Avatar image should be present!!"));
    return next();
  }
  if (!username || username.trim() === "") {
    res.status(400).json(new ApiError(400, "Please enter valid username!!"));
    return next();
  }
  if (!email || email.trim() === "") {
    res.status(400).json(new ApiError(400, "Please enter valid email!!"));
    return next();
  }
  if (!fullName || fullName.trim() === "") {
    res.status(400).json(new ApiError(400, "Please enter valid fullname!!"));
    return next();
  }
  if (!password || password.trim() === "") {
    res.status(400).json(new ApiError(400, "Please enter valid password!!"));
    return next();
  }

  const userDetails = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (userDetails) {
    res
      .status(409)
      .json(new ApiError(409, "Same username or email already exist!!"));
    return next();
  }
  const avatarUpload = await cloudinaryUpload(avatar);
  const coverImageUpload = await cloudinaryUpload(coverImage);
  if (!avatarUpload) {
    res
      .status(500)
      .json(new ApiError(500, "Can't upload image, cloudinary error!!"));
    return next();
  }
  const user = await new User({
    username,
    email,
    fullName,
    password,
    coverImage: coverImageUpload?.secure_url || "",
    avatar: avatarUpload?.secure_url || "",
  }).save();
  if (!user) {
    res.status(500).json(new ApiError(500, "Can't register user!!"));
    return next();
  }
  const responseData = {
    ...user._doc,
    password: undefined,
  };
  res.status(200).json(new ApiResponse(200, "User created", responseData));
  return next();
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res
      .status(400)
      .json(new ApiError(400, "All fields are mandatory!!"));
  }
  if (userId.trim() === "" || password.trim() === "") {
    return res
      .status(400)
      .json(new ApiError(400, "All fields are mandatory!!"));
  }
  const user = await User.findOne({
    $or: [{ username: userId }, { email: userId }],
  });
  if (!user) {
    return res.status(404).json(new ApiError(404, "No such user exist!!"));
  }
  const isValidUser = await user.isPasswordValid(password);
  if (!isValidUser) {
    return res.status(401).json(new ApiError(401, "Wrong credentials!!"));
  }
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  const responseData = {
    ...user._doc,
    password: undefined,
    accessToken,
  };
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "Your user data", responseData));
});

const logoutUser = asyncHandler(async (req, res, next) => {
  const { user } = req.body;
  await User.findByIdAndUpdate(user._id, {
    $set: { refreshToken: null },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Logout successful!!"));
});

const updateUser = asyncHandler(async (req, res, next) => {
  try {
    const { user, data } = req.body;

    const avatar = (req.files?.avatar && req.files?.avatar[0]?.path) || null;
    const coverImage =
      (req.files?.coverImage && req.files?.coverImage[0]?.path) || null;

    req.body.avatarLocalUrl = avatar;
    req.body.coverImageLocalUrl = coverImage;

    const email = data?.email || "";
    const username = data?.username || "";
    const userDetails = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (userDetails) {
      res
        .status(409)
        .json(new ApiError(409, "Same username or email already exist!!"));
      return next();
    }

    if (avatar)
      data.avatar = await cloudinaryUpload(avatar).then(
        (data) => data.secure_url
      );
    if (coverImage)
      data.coverImage = await cloudinaryUpload(coverImage).then(
        (data) => data.secure_url
      );

    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    await User.findByIdAndUpdate(user._id, data);
    res.status(200).json(new ApiResponse(200, "User updated!!"));
    next();
  } catch (error) {
    res
      .status(500)
      .json(
        new ApiError(500, "Internal server error,can't update user!!", error)
      );
    next();
  }
});

const refreshTokenUser = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json(new ApiError(401, "Unauthorized access"));
  const userData = jwt.verify(token, REFRESH_TOKEN_SECRET);
  const user = await User.findById(userData._id);
  if (!user)
    return res.status(401).json(new ApiError(401, "Unauthorized access"));
  if (token !== user?.refreshToken)
    return res.status(401).json(new ApiError(401, "Unauthorized access"));
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  const options = {
    httpOnly: true,
    secure: true,
  };
  const responseData = {
    ...user._doc,
    password: undefined,
    accessToken,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "Your user data", responseData));
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const { user } = req.body;
  await User.findByIdAndDelete(user._id);
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User accout deleted successfully!!"));
});

const getCurrentUser = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", req.user));
});

const getUserChannelProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  if (!username?.trim()) {
    return res.status(400).json(new ApiError(400, "Username is missing!!"));
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    res.status(400).json(new ApiError(404, "Channel doesn't exist!!"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Channel fetched!!", channel[0]));
});

const getWatchHistory = asyncHandler(async (req, res, next) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Watch history fetched successfully",
        user[0].watchHistory
      )
    );
});

const populateWatchHistory = asyncHandler(async (req, res, next) => {
  try {
    const { user, videoId } = req.body;
    await User.findByIdAndUpdate(user._id, {
      $push: { watchHistory: videoId },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, "Added in watch history!!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

export {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  refreshTokenUser,
  deleteUser,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  populateWatchHistory,
};
