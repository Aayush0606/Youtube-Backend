import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();
subscriptionRouter.use(authenticate);

subscriptionRouter
  .route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

subscriptionRouter.route("/u/:subscriberId").get(getUserChannelSubscribers);

export { subscriptionRouter };
