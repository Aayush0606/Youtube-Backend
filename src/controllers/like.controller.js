import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError, ApiResponse } from "../utils/ApiResolve.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { user } = req.body;
    if (!videoId)
      return res.status(400).json(new ApiError(400, "Video ID is required!!"));
    const videoDetail = await Video.findById(videoId);
    if (!videoDetail)
      return res.status(404).json(new ApiError(404, "No such video exist!!"));
    if (!videoDetail.isPublished)
      return res.status(403).json(new ApiError(403, "Video is private!!"));
    const likeVideoDetail = await Like.find({
      $and: [{ likedBy: user._id }, { video: videoId }],
    });
    if (likeVideoDetail) {
      await Like.deleteOne({
        $and: [{ likedBy: user._id }, { video: videoId }],
      });
      return res.status(200).json(200, "Like toggled!!", { isLiked: 0 });
    }
    await new Like({
      video: videoId,
      likedBy: user._id,
    });
    return res.status(200).json(200, "Like toggled!!", { isLiked: 1 });
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { user } = req.body;
    if (!commentId)
      return res
        .status(400)
        .json(new ApiError(400, "Comment ID is required!!"));
    const commentDetail = await Comment.findById(commentId);
    if (!commentDetail)
      return res.status(404).json(new ApiError(404, "No such comment exist!!"));
    const likeCommentDetail = await Like.find({
      $and: [{ likedBy: user._id }, { comment: commentId }],
    });
    if (likeCommentDetail) {
      await Like.deleteOne({
        $and: [{ likedBy: user._id }, { comment: commentId }],
      });
      return res.status(200).json(200, "Like toggled!!", { isLiked: 0 });
    }
    await new Like({
      comment: commentId,
      likedBy: user._id,
    });
    return res.status(200).json(200, "Like toggled!!", { isLiked: 1 });
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res, next) => {
  try {
    const { tweetId } = req.params;
    const { user } = req.body;
    if (!tweetId)
      return res.status(400).json(new ApiError(400, "Tweet ID is required!!"));
    const tweetDetail = await Tweet.findById(tweetId);
    if (!tweetDetail)
      return res.status(404).json(new ApiError(404, "No such tweet exist!!"));
    const likeTweetDetail = await Like.find({
      $and: [{ likedBy: user._id }, { tweet: tweetId }],
    });
    if (likeTweetDetail) {
      await Like.deleteOne({
        $and: [{ likedBy: user._id }, { tweet: tweetId }],
      });
      return res.status(200).json(200, "Like toggled!!", { isLiked: 0 });
    }
    await new Like({
      tweet: tweetId,
      likedBy: user._id,
    });
    return res.status(200).json(200, "Like toggled!!", { isLiked: 1 });
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const getLikedVideos = asyncHandler(async (req, res, next) => {
  try {
    const { user } = req.body;
    const likeVideos = await Like.aggregate([
      {
        $match: { likedBy: user._id, video: { $ne: null } },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
        },
      },
    ]);
    if (!likeVideos || likeVideos.length === 0)
      res.status(200).json(200, "No videos liked yet!!");
    return res.status(200).json(200, "All liked videos!!", likeVideos[0]);
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
