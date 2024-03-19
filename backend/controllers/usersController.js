const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { User, validateUpdateUser } = require("../models/User");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");

/**----------------------------------------------------------------
 *  @desc Get All Users Profile
 *  @route /api/users/profile
 *  @method GET
 *  @access private (only admin)
 -----------------------------------------------------------------*/
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. fetch all users from DB
  const users = await User.find().select("-password").populate("posts");

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
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("posts");
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
  //TODO: 1. validation
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }
  //TODO: 2. Get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  //TODO: 3. Upload image to Cloudinary server
  const result = await cloudinaryUploadImage(imagePath);
  //TODO: 4. Get the user from DB
  const user = await User.findById(req.user.id);
  //TODO: 5. Delete old profile photo if it exists
  if (user.profilePhoto.publicId != null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }
  //TODO: 6. Change profile photo in DB
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();
  //TODO: 7. send a response to client
  res.status(200).json({
    message: "your profile photo uploaded successfully",
    profilePhoto: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  //TODO: 8. Remove image from the server
  fs.unlinkSync(imagePath);
});

/**----------------------------------------------------------------
 *  @desc Delete User Profile (Account)
 *  @route /api/users/profile/:id
 *  @method DELETE
 *  @access private (only admin or user himself)
 -----------------------------------------------------------------*/
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. get the user from DB
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  //TODO: 2. get all posts from DB
  //TODO: 3. get public ids from the posts
  //TODO: 4. delete all posts images from cloudinary belong to this user
  //TODO: 5. delete profile photo from cloudinary
  await cloudinaryRemoveImage(user.profilePhoto.publicId);
  //TODO: 6. delete user posts and comments
  //TODO: 7. delete user himself from DB
  await User.findByIdAndDelete(req.params.id);
  //TODO: 8. send a response to client
  res.status(200).json({ message: "your profile has been deleted" });
});
