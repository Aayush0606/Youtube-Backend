import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError, ApiResponse } from "../utils/ApiResolve.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res, next) => {
  try {
    const { user, content } = req.body;
    if (!content)
      return res.status(400).json(new ApiError(400, "Content is required!!"));
    if (content.trim() === "")
      return res.status(400).json(new ApiError(400, "Content is required!!"));
    const newTweet = await new Tweet({
      owner: user._id,
      content,
    }).save();
    if (!newTweet)
      return res.status(500).json(new ApiError(500, "Internal server error!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet created!!", newTweet));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const getUserTweets = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json(new ApiError(400, "User ID is required!!"));
    if (!isValidObjectId(userId))
      return res.status(400).json(new ApiError(400, "Not a valid id!!"));
    const userDetails = await User.findById(userId);
    if (!userDetails)
      return res.status(404).json(new ApiError(404, "No such user!!"));
    const userTweets = await Tweet.find({
      owner: userId,
    });
    if (!userTweets)
      return res.status(200).json(new ApiResponse(200, "No user tweets!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "User tweets", userTweets));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const updateTweet = asyncHandler(async (req, res, next) => {
  try {
    const { tweetId } = req.params;
    const { user, content } = req.body;
    if (!content)
      return res.status(400).json(new ApiError(400, "Content is required!!"));
    if (content.trim() === "")
      return res.status(400).json(new ApiError(400, "Content is required!!"));
    if (!tweetId)
      return res.status(400).json(new ApiError(400, "Tweet ID is required!!"));
    if (!isValidObjectId(tweetId))
      return res.status(400).json(new ApiError(400, "Not a valid id!!"));
    const tweetDetail = await Tweet.findById(tweetId);
    if (!tweetDetail)
      return res.status(404).json(new ApiError(404, "No such tweet!!"));
    if (tweetDetail.owner !== user._id)
      return res.status(401).json(new ApiError(401, "Not authorized!!"));
    await Tweet.findByIdAndUpdate(tweetId, { content: content });
    return res.status(200).json(new ApiResponse(200, "Updated!!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const deleteTweet = asyncHandler(async (req, res, next) => {
  try {
    const { tweetId } = req.params;
    const { user } = req.body;
    if (!tweetId)
      return res.status(400).json(new ApiError(400, "Tweet ID is required!!"));
    if (!isValidObjectId(tweetId))
      return res.status(400).json(new ApiError(400, "Not a valid id!!"));
    const tweetDetail = await Tweet.findById(tweetId);
    if (!tweetDetail)
      return res.status(404).json(new ApiError(404, "No such tweet!!"));
    if (tweetDetail.owner !== user._id)
      return res.status(401).json(new ApiError(401, "Not authorized!!"));
    await Tweet.findByIdAndDelete(tweetId);
    return res.status(200).json(new ApiResponse(200, "Updated!!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
