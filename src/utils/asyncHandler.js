const asyncHandler = (cb) => async (req, res, next) => {
  return Promise.resolve(cb(req, res, next)).catch((err) => next(err));
};

export { asyncHandler };
