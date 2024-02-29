import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.route("/stats").get(getChannelStats);
dashboardRouter.route("/videos").get(getChannelVideos);

export { dashboardRouter };
