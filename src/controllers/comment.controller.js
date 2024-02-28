import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError, ApiResponse } from "../utils/ApiResolve.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res, next) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res, next) => {
  // TODO: add a comment to a video
});

const updateComment = asyncHandler(async (req, res, next) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res, next) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
