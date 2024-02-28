import fs from "fs";
export const imageCleanup = async (req, res, next) => {
  if (req.body.avatarLocalUrl) fs.unlinkSync(req.body.avatarLocalUrl);
  if (req.body.coverImageLocalUrl) fs.unlinkSync(req.body.coverImageLocalUrl);
  return res;
};

export const videoCleanup = async (req, res, next) => {
  if (req.body.videoLocalUrl) fs.unlinkSync(req.body.videoLocalUrl);
  if (req.body.thumbnailLocalUrl) fs.unlinkSync(req.body.thumbnailLocalUrl);
  return res;
};
