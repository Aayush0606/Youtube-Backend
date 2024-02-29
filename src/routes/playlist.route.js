import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const playlistRouter = Router();

playlistRouter.use(authenticate);

playlistRouter.route("/").post(createPlaylist);
playlistRouter
  .route("/:playlistId")
  .get(getPlaylistById)
  .put(updatePlaylist)
  .delete(deletePlaylist);
playlistRouter.route("/add/:videoId/:playlistId").put(addVideoToPlaylist);
playlistRouter
  .route("/remove/:videoId/:playlistId")
  .put(removeVideoFromPlaylist);
playlistRouter.route("/user/:userId").get(getUserPlaylists);

export { playlistRouter };
