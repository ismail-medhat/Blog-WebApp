const router = require("express").Router();
const {
  registerUserCtrl,
  loginUserCtrl,
} = require("../controllers/authController");

// regiter route : api/auth/register
router.post("/register", registerUserCtrl);

// login route : api/auth/login
router.post("/login", loginUserCtrl);

module.exports = router;
