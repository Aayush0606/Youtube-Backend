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
    const subHistory = await Subscription.findOne({
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
    if (!channelId)
      return res
        .status(400)
        .json(new ApiError(400, "Channel ID is required!!"));
    const channelDetail = await User.findOne({ channel: channelId });
    if (!channelDetail)
      return res.status(404).json(new ApiError(404, "No such channel exist!!"));
    const subsriberDetails = await Subscription.aggregate([
      { $match: { channel: mongoose.Types.ObjectId(channelId) } },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "allUsers",
        },
      },
      { $unwind: "$allUsers" },
      {
        $group: {
          _id: "channel",
          subs: { $push: "$allUsers" },
        },
      },
      {
        $project: {
          _id: 0,
          subs: 1,
        },
      },
    ]);
    if (!subsriberDetails || subsriberDetails.length === 0)
      return res
        .status(200)
        .json(new ApiResponse(200, "No subscribers exist!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "Subscribers!!", subsriberDetails[0]));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const getSubscribedChannels = asyncHandler(async (req, res, next) => {
  try {
    const { subscriberId } = req.params;
    if (!subscriberId)
      return res
        .status(400)
        .json(new ApiError(400, "Subscriber ID is required!!"));
    const subscriberDetail = await User.findOne({ subscriber: subscriberId });
    if (!subscriberDetail)
      return res.status(404).json(new ApiError(404, "No such channel exist!!"));
    const channelDetails = await Subscription.aggregate([
      { $match: { subscriber: mongoose.Types.ObjectId(subscriberId) } },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "allChannels",
        },
      },
      { $unwind: "$allChannels" },
      {
        $group: {
          _id: "subscriber",
          channels: { $push: "$allChannels" },
        },
      },
      {
        $project: {
          _id: 0,
          channels: 1,
        },
      },
    ]);
    if (!channelDetails || channelDetails.length === 0)
      return res
        .status(200)
        .json(new ApiResponse(200, "No channel subscribed yet!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "Subscription!!", channelDetails[0]));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
