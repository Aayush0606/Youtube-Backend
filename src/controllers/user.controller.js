import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res, next) => {
  const { username, email, fullName, password } = req.body;
  res.status(200).json({ username, email, fullName, password });
});

const getUser = asyncHandler(async (req, res, next) => {
  const { username } = req.body;
  res.status(200).json({ username });
});

export { registerUser, getUser };
