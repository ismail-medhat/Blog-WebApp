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

/**----------------------------------------------------------------
 *  @desc Get All Posts
 *  @route /api/posts
 *  @method GET
 *  @access public 
 -----------------------------------------------------------------*/
module.exports.getAllPostsCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. fetch all posts (check if has pagination or not)
  const POST_PER_PAGE = 3;
  const { pageNumber, category } = req.query;
  let posts;
  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }

  //TODO: 2. send a response to client
  res.status(200).json(posts);
});

/**----------------------------------------------------------------
 *  @desc Get Single Post
 *  @route /api/posts/:id
 *  @method GET
 *  @access public 
 -----------------------------------------------------------------*/
module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. fetch post details depend on post id
  const post = await Post.findById(req.params.id).populate("user", [
    "-password",
  ]);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  //TODO: 2. send a response to client
  res.status(200).json(post);
});

/**----------------------------------------------------------------
 *  @desc Get Posts Count
 *  @route /api/posts/count
 *  @method GET
 *  @access public
 -----------------------------------------------------------------*/
module.exports.getPostsCountCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. fetch all posts count from DB
  const count = await Post.countDocuments();

  //TODO: 2. send a response to client
  res.status(200).json(count);
});

/**----------------------------------------------------------------
 *  @desc Delete Post
 *  @route /api/posts/:id
 *  @method Delete
 *  @access private (only admin or owner of the post)  
 -----------------------------------------------------------------*/
module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. fetch post details depend on post id
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  //TODO: 2. check authorization and delete post from DB
  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);
    //@TODO: delete comments that belong to this post
  } else {
    return res.status(403).json({ message: "access denied, forbidden" });
  }
  //TODO: 3. send a response to client
  res
    .status(200)
    .json({ message: "post has been deleted successfully", postId: post._id });
});
