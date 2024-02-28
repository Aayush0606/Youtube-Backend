import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResopnse } from "../utils/ApiResolve.js";
import { User } from "../models/user.model.js";
import { cloudinaryUpload } from "../utils/cloudinaryUpload.js";
import { REFRESH_TOKEN_SECRET } from "../constants.js";
import fs from "fs";

const imageCleanup = async (req, res, next) => {
  if (req.body.avatarLocalUrl) fs.unlinkSync(req.body.avatarLocalUrl);
  if (req.body.coverImageLocalUrl) fs.unlinkSync(req.body.coverImageLocalUrl);
  return res;
};

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
  const avatarUpload = null;
  const coverImageUpload = null;
  // const avatarUpload = await cloudinaryUpload(avatar);
  // const coverImageUpload = await cloudinaryUpload(coverImage);
  // if (!avatarUpload) {
  //    res
  //     .status(500)
  //     .json(new ApiError(500, "Can't upload image, cloudinary error!!"));
  //     return next();
  // }
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
  res.status(200).json(new ApiResopnse(200, "User created", responseData));
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
    res.status(401).json(new ApiError(401, "Wrong credentials!!"));
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
    .json(new ApiResopnse(200, "Your user data", responseData));
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
    .json(new ApiResopnse(200, "Logout successful!!"));
});

const updateUser = asyncHandler(async (req, res, next) => {
  const { user, data } = req.body.user;

  const avatar = (req.files?.avatar && req.files?.avatar[0]?.path) || null;
  const coverImage =
    (req.files?.coverImage && req.files?.coverImage[0]?.path) || null;

  req.body.avatarLocalUrl = avatar;
  req.body.coverImageLocalUrl = coverImage;

  // if(avatar) data.avatar=await cloudinaryUpload(avatar);
  // if(avatar) data.coverImage=await cloudinaryUpload(coverImage);

  await User.findByIdAndUpdate(user._id, data);

  next();
});

const refreshTokenUser = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
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
    .json(new ApiResopnse(200, "Your user data", responseData));
});

export {
  registerUser,
  loginUser,
  imageCleanup,
  logoutUser,
  updateUser,
  refreshTokenUser,
};
