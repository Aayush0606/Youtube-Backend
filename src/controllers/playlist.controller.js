import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError, ApiResponse } from "../utils/ApiResolve.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res, next) => {
  try {
    const { user, name, description } = req.body;
    if (!name)
      return res.status(400).json(new ApiError(400, "Name is required!!"));
    if (!name.trim() === "")
      return res.status(400).json(new ApiError(400, "Name is required!!"));
    const newPlaylist = await new Playlist({
      name,
      description,
      owner: user._id,
    }).save();
    if (!newPlaylist)
      return res.status(500).json(new ApiError(500, "Internal server error!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist created!!", newPlaylist));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const getUserPlaylists = asyncHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json(new ApiError(400, "User ID is required!!"));
    const userPlaylists = await Playlist.find({ owner: userId });
    if (!userPlaylists)
      return res
        .status(200)
        .json(new ApiResponse(200, "No playlist for user!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "User playlists!!", userPlaylists));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const getPlaylistById = asyncHandler(async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    if (!playlistId)
      return res
        .status(400)
        .json(new ApiError(400, "Playlist ID is required!!"));
    const playListDetails = await Playlist.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(playlistId) } },
      {
        $project: {
          name: 1,
          description: 1,
          owner: 1,
          videos: {
            $cond: {
              if: {
                $eq: ["$owner", new mongoose.Types.ObjectId(req?.user?._id)],
              },
              then: "$videos",
              else: {
                $filter: {
                  input: "$videos",
                  cond: {
                    $eq: ["$$this.isPublished", true],
                  },
                },
              },
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    if (!playListDetails || playListDetails.length === 0)
      return res.status(200).json(new ApiResponse(200, "Empty playlist!!"));
    return res
      .status(200)
      .json(new ApiResponse(200, "Playlist!!", playListDetails[0]));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res, next) => {
  try {
    const { playlistId, videoId } = req.params;
    if (!playlistId || !videoId)
      return res.status(400).json(new ApiResponse(400, "Ids are required!!"));
    const videoDetail = await Video.findById(videoId);
    const playlistDetail = await Playlist.findById(playlistId);
    if (!videoDetail)
      return res.status(404).json(new ApiError(404, "No such video exist!!"));
    if (!videoDetail.isPublished)
      return res
        .status(404)
        .json(new ApiResponse(404, "No such video exist!!"));
    if (!playlistDetail)
      return res
        .status(404)
        .json(new ApiError(404, "No such playlist exist!!"));
    if (playlistDetail.owner !== req.body.user?._id)
      return res.status(401).json(new ApiError(401, "Not authorized!!"));
    await Playlist.findByIdAndUpdate(playlistId, {
      $push: { videos: videoId },
    });
    res.status(200).json(new ApiResponse(200, "Video added in playlist!!"));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {
  try {
    const { playlistId, videoId } = req.params;
    if (!playlistId || !videoId)
      return res.status(400).json(new ApiResponse(400, "Ids are required!!"));
    const videoDetail = await Video.findById(videoId);
    const playlistDetail = await Playlist.findById(playlistId);
    if (!videoDetail)
      return res.status(404).json(new ApiError(404, "No such video exist!!"));
    if (!playlistDetail)
      return res
        .status(404)
        .json(new ApiError(404, "No such playlist exist!!"));
    if (!playlistDetail.videos.includes(videoId))
      return res
        .status(404)
        .json(new ApiError(404, "No such video in playlist!!"));
    if (playlistDetail.owner !== req.body.user?._id)
      return res.status(401).json(new ApiError(401, "Not authorized!!"));
    await Playlist.updateOne(
      { _id: playlistId },
      {
        $pull: { videos: videoId },
      }
    );
    res.status(200).json(new ApiResponse(200, "Video added in playlist!!"));
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const deletePlaylist = asyncHandler(async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    if (!playlistId)
      return res
        .status(400)
        .json(new ApiResponse(400, "Playlist ID is required!!"));
    const playlistDetail = await Playlist.findById(playlistId);
    if (!playlistDetail)
      return res
        .status(404)
        .json(new ApiError(404, "No such playlist exist!!"));
    if (playlistDetail.owner !== req.body.user?._id)
      return res.status(401).json(new ApiError(401, "Not authorized!!"));
    await Playlist.findByIdAndDelete(playlistId);
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

const updatePlaylist = asyncHandler(async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    if (!playlistId)
      return res
        .status(400)
        .json(new ApiResponse(400, "Playlist ID is required!!"));
    const playlistDetail = await Playlist.findById(playlistId);
    if (!playlistDetail)
      return res
        .status(404)
        .json(new ApiError(404, "No such playlist exist!!"));
    if (playlistDetail.owner !== req.body.user?._id)
      return res.status(401).json(new ApiError(401, "Not authorized!!"));
    await Playlist.findByIdAndUpdate(playlistId, { name, description });
  } catch (error) {
    res.status(500).json(new ApiError(500, "Internal server error!!"));
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
