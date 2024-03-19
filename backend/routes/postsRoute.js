const { createPostCtrl } = require("../controllers/postsController");
const uploadPhoto = require("../middlewares/photoUpload");
const {
  verifyTokenAndOnlyUser,
  verifyToken,
} = require("../middlewares/verifyToken");

const router = require("express").Router();

// create new post : api/posts
router
  .route("/")
  .post(verifyToken, uploadPhoto.single("image"), createPostCtrl);

module.exports = router;
