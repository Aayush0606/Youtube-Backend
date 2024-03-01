import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError, ApiResponse } from "../utils/ApiResolve.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryUpload } from "../utils/cloudinaryUpload.js";

const getAllVideos = asyncHandler(async (req, res, next) => {
  try {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const pageNo = parseInt(page),
      limitPerPage = parseInt(limit);
    const pipeline = [];
    if (query) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
          owner: userId,
        },
      });
    }
    if (sortBy) {
      pipeline.push({
        $sort: {
          sortBy: sortType === "desc" ? -1 : 1,
        },
      });
    }
    pipeline.push({ $skip: (pageNo - 1) * limitPerPage });
    pipeline.push({ $limit: limitPerPage });
    const videoDetail = await Video.aggregatePaginate(
      Video.aggregate(pipeline)
    );
    if (!videoDetail)
      return res.status(500).json(new ApiError(500, "Internal server error!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "All user videos!!", videoDetail));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const publishAVideo = asyncHandler(async (req, res, next) => {
  try {
    const { title, description, user } = req.body;
    const video =
      (req.files?.videoFile && req.files?.videoFile[0]?.path) || null;
    const thumbnail =
      (req.files?.thumbnail && req.files?.thumbnail[0]?.path) || null;
    if (video) req.body.videoLocalUrl = video;
    if (thumbnail) req.body.thumbnailLocalUrl = thumbnail;
    if (!video || !thumbnail) {
      res
        .status(400)
        .json(new ApiError(400, "Video and thumbnail are required!!"));
      return next();
    }
    if (!title || title.trim() === "") {
      res.status(400).json(new ApiError(400, "Title is required!!"));
      return next();
    }
    const videoUploadData = await cloudinaryUpload(video);
    const thumbnailUploadData = await cloudinaryUpload(thumbnail);
    if (!videoUploadData || !thumbnailUploadData) {
      res
        .status(500)
        .json(new ApiError(500, "Internal cloudinary server error!!"));
      return next();
    }
    const newVideo = await new Video({
      videoFile: videoUploadData.secure_url,
      thumbnail: thumbnailUploadData.secure_url,
      owner: user._id,
      title: title,
      description: description || "",
      duration: videoUploadData.duration,
    }).save();
    if (!newVideo) {
      res.status(500).json(new ApiError(500, "Internal server error!!"));
      return next();
    }
    res.status(200).json(new ApiResponse(200, "Video uploaded!!", newVideo));
    return next();
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error!!"));
    return next();
  }
});

const getVideoById = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { user } = req.body;
    if (!videoId || isValidObjectId(videoId))
      return res.status(400).json(new ApiError(400, "Video ID is required!!"));
    const videoDetail = await Video.findById(videoId);
    if (!videoDetail)
      return res.status(404).json(new ApiError(404, "No such video exist!!"));
    if (!videoDetail.isPublished && videoDetail.owner !== user._id)
      return res.status(404).json(new ApiError(404, "No such video exist!!"));
    const updatedVideoDetails = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!updatedVideoDetails)
      return res.status(500).json(new ApiError(500, "Internal server error!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "Video data!!", updatedVideoDetails));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const updateVideo = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { user, data } = req.body;
    const thumbnail =
      (req.files?.thumbnail && req.files?.thumbnail[0]?.path) || null;
    if (thumbnail) req.body.thumbnailLocalUrl = thumbnail;
    if (!videoId || !isValidObjectId(videoId)) {
      res.status(400).json(new ApiError(400, "Video ID is required!!"));
      return next();
    }

    const videoDetail = await Video.findById(videoId);
    if (!videoDetail) {
      res.status(404).json(new ApiError(404, "No such video exist!!"));
      return next();
    }
    if (videoDetail.owner !== user._id) {
      res.status(401).json(new ApiError(401, "Not authorized!!"));
      return next();
    }
    if (thumbnail) {
      data.thumbnail = await cloudinaryUpload(thumbnail).then(
        (data) => data?.secure_url
      );
      if (!data.thumbnail) {
        res
          .status(500)
          .json(new ApiError(500, "Internal cloudinary server error!!"));
        next();
      }
    }
    const newVideo = await Video.findByIdAndUpdate(videoId, data, {
      new: true,
    });
    if (!newVideo) {
      res.status(500).json(new ApiError(500, "Internal server error!!"));
      next();
    }
    res
      .status(200)
      .json(new ApiResponse(200, "Updated successfully!!", newVideo));
    next();
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error!!"));
    next();
  }
});

const deleteVideo = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { user } = req.body;
    if (!videoId || !isValidObjectId(videoId))
      return res.status(400).json(new ApiError(400, "Video ID is required!!"));
    const videoDetail = await Video.findById(videoId);
    if (!videoDetail)
      return res.status(404).json(new ApiError(404, "No such video exist!!"));
    if (videoDetail.owner !== user._id)
      return res.status(401).json(new ApiError(401, "Not authorized!!"));
    await Video.findByIdAndDelete(videoId);
    await Like.deleteMany({ video: videoId });
    await Comment.deleteMany({ video: videoId });
    await Playlist.updateMany(
      { videos: videoId },
      {
        $pull: { videos: videoId },
      }
    );
    return res.status(200).json(new ApiResponse(200, "Video Deleted!!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const togglePublishStatus = asyncHandler(async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { user } = req.body;
    if (!videoId || !isValidObjectId(videoId))
      return res.status(400).json(new ApiError(400, "Video ID is required!!"));
    const videoDetail = await Video.findById(videoId);
    if (!videoDetail)
      return res.status(404).json(new ApiError(404, "No such video exist!!"));
    if (videoDetail.owner !== user._id)
      return res.status(401).json(new ApiError(401, "Not authorized!!"));
    await Video.findByIdAndUpdate(videoId, {
      isPublished: !videoDetail.isPublished,
    });
    return res.status(200).json(new ApiResponse(200, "Toggled successfully!!"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
