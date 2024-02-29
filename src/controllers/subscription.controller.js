import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError, ApiResponse } from "../utils/ApiResolve.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { user } = req.body;
    if (!channelId)
      return res
        .status(400)
        .json(new ApiError(400, "Channel ID is required!!"));
    const channelDetail = await User.findById(channelId);
    if (!channelDetail)
      return res.status(404).json(new ApiError(404, "No such channel exist!!"));
    const subHistory = await Subscription.find({
      channel: channelId,
      subscriber: user._id,
    });
    if (!subHistory) {
      await new Subscription({
        channel: channelId,
        subscriber: user._id,
      }).save();
    } else {
      await User.deleteOne({
        channel: channelId,
        subscriber: user._id,
      });
    }
    return res.status(200).json(new ApiResponse(200, "Subscription toggled!!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { user } = req.body;
    if (!channelId)
      return res
        .status(400)
        .json(new ApiError(400, "Channel ID is required!!"));
    const channelDetail = await User.findById(channelId);
    if (!channelDetail)
      return res.status(404).json(new ApiError(404, "No such channel exist!!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res, next) => {
  const { subscriberId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
