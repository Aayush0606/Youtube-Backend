import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResopnse } from "../utils/ApiResolve.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, fullName, password } = req.body;
  if (!username || username.trim() === "")
    return res
      .status(400)
      .json(new ApiError(400, "Please enter valid username!!"));
  if (!email || email.trim() === "")
    return res
      .status(400)
      .json(new ApiError(400, "Please enter valid email!!"));
  if (!fullName || fullName.trim() === "")
    return res
      .status(400)
      .json(new ApiError(400, "Please enter valid fullname!!"));
  if (!password || password.trim() === "")
    return res
      .status(400)
      .json(new ApiError(400, "Please enter valid password!!"));

  const userDetails = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (userDetails)
    return res
      .status(409)
      .json(new ApiError(409, "Same username or email already exist!!"));
  const avatar = (req.files?.avatar && req.files?.avatar[0]?.path) || null;
  if (!avatar)
    return res
      .status(400)
      .json(new ApiError(400, "Avatar image should be present!!"));
  const coverImage =
    (req.files?.coverImage && req.files?.coverImage[0]?.path) || null;
  const user = await new User({
    username,
    email,
    fullName,
    password,
    coverImage,
  }).save();
  console.log(user);
  res.status(200).json(new ApiResopnse(200, "User created"));
});

const getUser = asyncHandler(async (req, res, next) => {
  const { username } = req.body;
  res.status(200).json({ username });
});

export { registerUser, getUser };
