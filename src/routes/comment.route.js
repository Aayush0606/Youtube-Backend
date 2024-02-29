import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const commentRouter = Router();
commentRouter.use(authenticate);
commentRouter.route("/:videoId").get(getVideoComments).post(addComment);
commentRouter.route("/c/:commentId").delete(deleteComment).put(updateComment);

export { commentRouter };
