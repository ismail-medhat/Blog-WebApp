const {
  createPostCtrl,
  getAllPostsCtrl,
  getSinglePostCtrl,
  getPostsCountCtrl,
  deletePostCtrl,
} = require("../controllers/postsController");
const uploadPhoto = require("../middlewares/photoUpload");
const validateObjectId = require("../middlewares/validateObjectId");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

const router = require("express").Router();

// create new post : api/posts
router
  .route("/")
  .post(verifyToken, uploadPhoto.single("image"), createPostCtrl)
  .get(getAllPostsCtrl);

// get posts count route : api/posts/count
router.route("/count").get(getPostsCountCtrl);

// get single post : api/posts/:id
router
  .route("/:id")
  .get(validateObjectId, getSinglePostCtrl)
  .delete(validateObjectId, verifyToken, deletePostCtrl);

module.exports = router;
