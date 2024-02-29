import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError, ApiResponse } from "../utils/ApiResolve.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res, next) => {
  try {
    const { user } = req.body;
    const channelStats = await Video.aggregate([
      {
        $match: { owner: new mongoose.Types.ObjectId(user._id) },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "allLikedId",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "owner",
          foreignField: "channel",
          as: "allSubscribersId",
        },
      },
      {
        $lookup: {
          from: "playlists",
          localField: "owner",
          foreignField: "owner",
          as: "allPlaylistId",
        },
      },
      {
        $lookup: {
          from: "tweets",
          localField: "owner",
          foreignField: "owner",
          as: "allTweetId",
        },
      },
      {
        $addFields: {
          subscriberCount: {
            $size: "$allSubscribersId",
          },
          playlistCount: {
            $size: "$allPlaylistId",
          },
          tweetCount: {
            $size: "$allTweetId",
          },
          likeCount: {
            $size: "$allLikedId",
          },
          videoCount: {
            $sum: 1,
          },
          viewCount: {
            $sum: "$views",
          },
        },
      },
      {
        $project: {
          subscriberCount: 1,
          playlistCount: 1,
          tweetCount: 1,
          allLikedId: 1,
          videoCount: 1,
          viewCount: 1,
        },
      },
    ]);
    if (!channelStats || channelStats.length === 0)
      res.status(200).json(new ApiResponse(200, "No stats to display!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "Channel stats!!", channelStats[0]));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const getChannelVideos = asyncHandler(async (req, res, next) => {
  try {
    const { user } = req.body;
    const channelVideos = await Video.find({ owner: user._id });
    if (!channelVideos || channelVideos.length === 0)
      return res
        .status(200)
        .json(new ApiResponse(200, "No video for channel!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "All available videos!!", channelVideos));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

export { getChannelStats, getChannelVideos };
