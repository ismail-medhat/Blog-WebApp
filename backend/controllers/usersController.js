const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateUpdateUser } = require("../models/User");

/**----------------------------------------------------------------
 *  @desc Get All Users Profile
 *  @route /api/users/profile
 *  @method GET
 *  @access private (only admin)
 -----------------------------------------------------------------*/
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. fetch all users from DB
  const users = await User.find().select("-password");

  //TODO: 2. send a response to client
  res.status(200).json(users);
});

/**----------------------------------------------------------------
 *  @desc Get User Profile
 *  @route /api/users/profile/:id
 *  @method GET
 *  @access public
 -----------------------------------------------------------------*/
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. get user profile data from DB
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  //TODO: 2. send a response to client
  res.status(200).json(user);
});

/**----------------------------------------------------------------
 *  @desc Update User Profile
 *  @route /api/users/profile/:id
 *  @method PUT
 *  @access private (only user himself)
 -----------------------------------------------------------------*/
module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. Validation
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //TODO: 2. encrypt password if existing in body
  if (req.body.password) {
    const solt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, solt);
  }

  //TODO: 3. update user on DB
  const updateUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
      },
    },
    { new: true }
  ).select("-password");

  //TODO: 4. send a response to client
  res.status(200).json(updateUser);
});

/**----------------------------------------------------------------
 *  @desc Get Users Count
 *  @route /api/users/count
 *  @method GET
 *  @access private (only admin)
 -----------------------------------------------------------------*/
module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. fetch all users from DB
  const count = await User.countDocuments();

  //TODO: 2. send a response to client
  res.status(200).json(count);
});

/**----------------------------------------------------------------
 *  @desc Profile Photo Upload
 *  @route /api/users/profile/profile-photo-upload
 *  @method POST
 *  @access private (only logged in users)
 -----------------------------------------------------------------*/
module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. update profile user photo in DB

  //TODO: 2. send a response to client
  res.status(200).json({ message: "your profile photo uploaded successfully" });
});
