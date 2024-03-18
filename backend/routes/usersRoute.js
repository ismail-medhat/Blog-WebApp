const router = require("express").Router();
const {
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyToken,
} = require("../middlewares/verifyToken");
const {
  getAllUsersCtrl,
  getUserProfileCtrl,
  updateUserProfileCtrl,
  getUsersCountCtrl,
  profilePhotoUploadCtrl,
} = require("../controllers/usersController");
const validateObjectId = require("../middlewares/validateObjectId");

// get all users route : api/users/profile
router.route("/profile").get(verifyTokenAndAdmin, getAllUsersCtrl);

// get and update user route : api/users/profile/:id
router
  .route("/profile/:id")
  .get(validateObjectId, getUserProfileCtrl)
  .put(validateObjectId, verifyTokenAndOnlyUser, updateUserProfileCtrl);

// update profile user photo route : api/users/profile/profile-photo-upload
router
  .route("/profile/profile-photo-upload")
  .post(verifyToken, profilePhotoUploadCtrl);

// get users count route : api/users/count
router.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl);

module.exports = router;
