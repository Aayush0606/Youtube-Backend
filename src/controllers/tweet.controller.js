import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError, ApiResponse } from "../utils/ApiResolve.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res, next) => {
  //TODO: create tweet
});

const getUserTweets = asyncHandler(async (req, res, next) => {
  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res, next) => {
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res, next) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
