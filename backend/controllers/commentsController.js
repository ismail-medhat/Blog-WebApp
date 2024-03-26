const asyncHandler = require("express-async-handler");
const {
  Comment,
  validateCreateComment,
  validateUpdateComment,
} = require("../models/Comment");

const { User } = require("../models/User");

/**----------------------------------------------------------------
 *  @desc Create New Comment
 *  @route /api/comments
 *  @method POST
 *  @access private (only logged in users)
 -----------------------------------------------------------------*/
module.exports.createCommentCtrl = asyncHandler(async (req, res) => {
  // 1. validateion
  const { error } = validateCreateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2. Get profile user information
  const profile = await User.findById(req.user.id);

  // 3. Create new comment in Commnts DB
  const comment = await Comment.create({
    postId: req.body.postId,
    text: req.body.text,
    user: req.user.id,
    username: profile.username,
  });

  // 4. Send response to client
  res.status(201).json(comment);
});

/**----------------------------------------------------------------
 *  @desc Get All Comments
 *  @route /api/comments
 *  @method GET
 *  @access private (only admin)
 -----------------------------------------------------------------*/
module.exports.getAllCommentsCtrl = asyncHandler(async (req, res) => {
  // 1. Get all comments list
  const comments = await Comment.find().populate("user", ["-password"]);

  // 4. Send response to client
  res.status(200).json(comments);
});

/**----------------------------------------------------------------
 *  @desc Delete Comment
 *  @route /api/comments/:id
 *  @method DELETE
 *  @access private (only admin or owner of the comment)
 -----------------------------------------------------------------*/
module.exports.deleteCommentCtrl = asyncHandler(async (req, res) => {
  // 1. Get comment data
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: "comment not found" });

  // 2. Validate authorization
  if (req.user.isAdmin || req.user.id === comment.user.toString()) {
    await Comment.findByIdAndDelete(req.params.id);
    // 3. Send response to client
    res.status(200).json({ message: "comment deleted successfully" });
  } else {
    res.status(403).json({ message: "access denied, not allowed" });
  }
});

/**----------------------------------------------------------------
 *  @desc Update Comment
 *  @route /api/comments/:id
 *  @method PUT
 *  @access private (only owner of the comment)
 -----------------------------------------------------------------*/
module.exports.updateCommentCtrl = asyncHandler(async (req, res) => {
  // 1. validateion
  const { error } = validateUpdateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2. Get comment information from DB
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: "comment not found" });

  // 3. Validate authorization
  if (req.user.id != comment.user.toString()) {
    res.status(403).json({
      message: "access denied, only user himself can be edit comment",
    });
  } else {
    const updateComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          text: req.body.text,
        },
      },
      { new: true }
    );
    // 4. Send response to client
    res.status(200).json(updateComment);
  }
});

/**----------------------------------------------------------------
 *  @desc Get Comments Count
 *  @route /api/comments/count
 *  @method GET
 *  @access public
 -----------------------------------------------------------------*/
module.exports.getCommentsCountCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. fetch all comments count from DB
  const count = await Comment.countDocuments();

  //TODO: 2. send a response to client
  res.status(200).json(count);
});
