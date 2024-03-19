const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/Post");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");

/**----------------------------------------------------------------
 *  @desc Create New Post
 *  @route /api/posts
 *  @method POST
 *  @access private (only logged in users)
 -----------------------------------------------------------------*/
module.exports.createPostCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. validation for image
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }
  //TODO: 2. validation for post data
  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //TODO: 3. upload photo to cloudinary
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);
  //TODO: 4. create new post and save it in DB
  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  //TODO: 5. send a response to client
  res.status(200).json(post);
  //TODO: 6. remove post image from server
  fs.unlinkSync(imagePath);
});
