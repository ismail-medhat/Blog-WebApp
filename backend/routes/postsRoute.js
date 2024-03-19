const {
  createPostCtrl,
  getAllPostsCtrl,
  getSinglePostCtrl,
  getPostsCountCtrl,
  deletePostCtrl,
  updatePostCtrl,
  updatePostImageCtrl,
  toggleLikePostCtrl,
} = require("../controllers/postsController");
const uploadPhoto = require("../middlewares/photoUpload");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyToken } = require("../middlewares/verifyToken");

const router = require("express").Router();

// api/posts
router
  .route("/")
  .post(verifyToken, uploadPhoto.single("image"), createPostCtrl)
  .get(getAllPostsCtrl);

// get posts count route : api/posts/count
router.route("/count").get(getPostsCountCtrl);

// api/posts/:id
router
  .route("/:id")
  .get(validateObjectId, getSinglePostCtrl)
  .delete(validateObjectId, verifyToken, deletePostCtrl)
  .put(validateObjectId, verifyToken, updatePostCtrl);

// api/posts/upload-image/:id
router
  .route("/upload-image/:id")
  .put(
    validateObjectId,
    verifyToken,
    uploadPhoto.single("image"),
    updatePostImageCtrl
  );

// api/posts/like/:id
router
  .route("/like/:id")
  .put(validateObjectId, verifyToken, toggleLikePostCtrl);

module.exports = router;
