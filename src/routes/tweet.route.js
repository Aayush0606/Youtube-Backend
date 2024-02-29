import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const tweetRouter = Router();
tweetRouter.use(authenticate);

tweetRouter.route("/").post(createTweet);
tweetRouter.route("/user/:userId").get(getUserTweets);
tweetRouter.route("/:tweetId").put(updateTweet).delete(deleteTweet);

export { tweetRouter };
