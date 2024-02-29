import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  refreshTokenUser,
  deleteUser,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  populateWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { imageCleanup } from "../utils/fileCleanup.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
  imageCleanup
);
userRouter.route("/update").put(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  authenticate,
  updateUser,
  imageCleanup
);
userRouter.route("/login").get(loginUser);
userRouter.route("/logout").post(authenticate, logoutUser);
userRouter.route("/refresh-token").post(refreshTokenUser);
userRouter.route("/delete").delete(authenticate, deleteUser);
userRouter.route("/current-user").get(authenticate, getCurrentUser);
userRouter.route("/update-history").put(authenticate, populateWatchHistory);
userRouter.route("/c/:username").get(authenticate, getUserChannelProfile);
userRouter.route("/history").get(authenticate, getWatchHistory);

export { userRouter };
