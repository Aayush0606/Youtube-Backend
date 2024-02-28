import fs from "fs";
export const imageCleanup = async (req, res, next) => {
  if (req.body.avatarLocalUrl) fs.unlinkSync(req.body.avatarLocalUrl);
  if (req.body.coverImageLocalUrl) fs.unlinkSync(req.body.coverImageLocalUrl);
  return res;
};
