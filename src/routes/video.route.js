import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { videoCleanup } from "../utils/fileCleanup.js";

const videoRouter = Router();
videoRouter.use(authenticate);

videoRouter
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    publishAVideo,
    videoCleanup
  );
videoRouter
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .put(upload.single("thumbnail"), updateVideo, videoCleanup);
videoRouter.route("/toggle/publish/:videoId").put(togglePublishStatus);

export { videoRouter };
