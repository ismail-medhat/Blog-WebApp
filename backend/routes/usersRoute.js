const router = require("express").Router();
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const { getAllUsersCtrl } = require("../controllers/usersController");

// get all users route : api/users/profile
router.route("/profile").get(verifyTokenAndAdmin, getAllUsersCtrl);

module.exports = router;
