import User from "../models/user.models.js";
import APIFeatures from "../utils/apifeatures.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getUsers = asyncHandler(async (req, res, next) => {
  let baseQuery = User.find().select("-password");

  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .search(["name", "email"])
    .sort()
    .paginate();

  const users = await features.query;

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});
