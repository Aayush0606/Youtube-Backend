import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  refreshTokenUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { imageCleanup } from "../utils/imageCleanup.js";

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

userRouter.route("/login").get(loginUser);

userRouter.route("/delete").delete(authenticate, deleteUser);

userRouter.route("/logout").post(authenticate, logoutUser);

userRouter.route("/refresh-token").post(refreshTokenUser);

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

export { userRouter };
