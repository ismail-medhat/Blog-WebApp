const asyncHandler = require("express-async-handler");
const { User } = require("../models/User");

/**----------------------------------------------------------------
 *  @desc Get All Users Profile
 *  @route /api/users/profile
 *  @method GET
 *  @access private (only admin)
 -----------------------------------------------------------------*/
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. fetch all users from DB
  const users = await User.find();

  //TODO: 2. send a response to client
  res.status(201).json(users);
});
