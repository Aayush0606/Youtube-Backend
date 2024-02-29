import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError, ApiResponse } from "../utils/ApiResolve.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!videoId)
      return res.status(400).json(new ApiError(400, "Video id is required!!"));
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
    };
    const video = await Video.findById(videoId);
    if (!video)
      return res.status(404).json(new ApiError(404, "No such video exist!!"));
    const videoDetails = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comment",
          as: "likes",
        },
      },
      {
        $addFields: {
          likeCount: {
            $size: "$likes",
          },
          owner: {
            $first: "$owner",
          },
          isLiked: {
            $cond: {
              if: { $in: [req.user._id, "$likes.likedBy"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          content: 1,
          updatedAt: 1,
          likeCount: 1,
          isLiked: 1,
          owner: {
            username: 1,
            fullname: 1,
            avatar: 1,
          },
        },
      },
    ]);
    const videoComments = await Comment.aggregatePaginate(
      videoDetails,
      options
    );
    if (!videoComments || videoComments.length === 0)
      return res.status(200).json(new ApiResponse(200, "No comments exist!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "Comments fetched!!", videoComments));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const addComment = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { user, content } = req.body;
    if (!videoId || !content)
      return res.status(400).json(new ApiError(400, "Not sufficient data!!"));
    if (videoId.trim() === "" || content.trim() === "")
      return res.status(400).json(new ApiError(400, "Not valid data!!"));
    const comment = await new Comment({
      content,
      video: videoId,
      owner: user?._id,
    }).save();
    if (!comment)
      return res.status(500).json(new ApiError(500, "Internal server error!!"));
    return res.status(200).json(new ApiResponse(200, "Comment posted!!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const updateComment = asyncHandler(async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { user, content } = req.body;
    if (!content || !commentId)
      return res.status(400).json(new ApiError(400, "Not valid data!!"));
    if (content.trim() === "")
      return res.status(400).json(new ApiError(400, "Not valid data!!"));
    const commentDetail = await Comment.findById(commentId);
    if (!commentDetail)
      return res.status(404).json(new ApiError(404, "No such comment!!"));
    const videoDetail = await Video.findById(commentDetail.video);
    if (!videoDetail)
      return res.status(404).json(new ApiError(404, "No such video!!"));
    if (!videoDetail.isPublished)
      return res.status(404).json(new ApiError(404, "No such video!!"));
    if (commentDetail.owner !== user._id)
      return res.status(401).json(new ApiError(401, "Not authorized!!"));
    await Comment.findByIdAndUpdate(commentId, {
      $set: { content },
    });
    res.status(200).json(new ApiResponse(200, "Comment updated!!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const deleteComment = asyncHandler(async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { user } = req.body;
    if (!commentId)
      return res.status(400).json(new ApiError(400, "No such comment!!"));
    const commentDetail = await Comment.findById(commentId);
    if (!commentDetail)
      return res.status(404).json(new ApiError(404, "No such comment!!"));
    const videoDetail = await Video.findById(commentDetail.video);
    if (!videoDetail)
      return res.status(404).json(new ApiError(404, "Video no longer exist!!"));
    if (!videoDetail.isPublished)
      return res.status(404).json(new ApiError(404, "Video no longer exist!!"));
    if (commentDetail.owner !== user._id && videoDetail.owner !== user._id)
      return res.status(401).json(new ApiError(401, "Not authorized!!"));
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json(new ApiResponse(200, "Comment deleted!!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
