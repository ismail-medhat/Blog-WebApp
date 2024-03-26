const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/Post");
const { Comment } = require("../models/Comment");
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
  const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");
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
    //TODO: delete comments that belong to this post
    await Comment.deleteMany({ postId: post._id });
  } else {
    return res.status(403).json({ message: "access denied, forbidden" });
  }
  //TODO: 3. send a response to client
  res
    .status(200)
    .json({ message: "post has been deleted successfully", postId: post._id });
});

/**----------------------------------------------------------------
 *  @desc Update Post
 *  @route /api/posts/:id
 *  @method PUT
 *  @access private (only owner of the post)
 -----------------------------------------------------------------*/
module.exports.updatePostCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. Validation
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //TODO: 2. get the post from DB and check if post exists
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  //TODO: 3. check if this post bleng to user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  //TODO: 4. update post on DB
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"]);

  //TODO: 5. send a response to client
  res.status(200).json(updatedPost);
});

/**----------------------------------------------------------------
 *  @desc Update Post Image
 *  @route /api/posts/upload-image/:id
 *  @method PUT
 *  @access private (only owner of the post)
 -----------------------------------------------------------------*/
module.exports.updatePostImageCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. validation
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }

  //TODO: 2. get the post from DB and check if post exists
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  //TODO: 3. check if this post bleng to user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  //TODO: 4. delete old post image
  await cloudinaryRemoveImage(post.image.publicId);
  //TODO: 4. upload new post image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  //TODO: 6. Change psot image in DB
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  //TODO: 7. send a response to client
  res.status(200).json(updatedPost);
  //TODO: 8. Remove image from the server
  fs.unlinkSync(imagePath);
});

/**----------------------------------------------------------------
 *  @desc Toggle Like Post Image
 *  @route /api/posts/like/:id
 *  @method PUT
 *  @access private (only logged in users)
 -----------------------------------------------------------------*/
module.exports.toggleLikePostCtrl = asyncHandler(async (req, res) => {
  const loggedInUser = req.user.id;
  const { id: postId } = req.params;
  //TODO: 1. get the post from DB and check if post exists
  let post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  //TODO: 2. check if user exist in likes array or not
  const isPostAlreadyLiked = post.likes.find(
    (userId) => userId.toString() === loggedInUser
  );

  if (isPostAlreadyLiked) {
    // remove user id from likes array
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: {
          likes: loggedInUser,
        },
      },
      { new: true }
    );
  } else {
    // add user id from likes array
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          likes: loggedInUser,
        },
      },
      { new: true }
    );
  }

  //TODO: 3. send a response to client
  res.status(200).json(post);
});
