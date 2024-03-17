const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  validateRegiterUser,
  validateLoginUser,
} = require("../models/User");

/**----------------------------------------------------------------
 *  @desc Register New User
 *  @route /api/auth/register
 *  @method POST
 *  @access public
 -----------------------------------------------------------------*/
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. Validation
  const { error } = validateRegiterUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //TODO: 2. check user exist on DB or not
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ message: "user already exist" });
  }

  //TODO: 3. hash user password
  const solt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, solt);

  //TODO: 4. add new user to DB
  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });
  await user.save();

  //TODO: 5. verify account

  //TODO: 6. send a response to client
  res
    .status(201)
    .json({ message: "you registered successfully, please log in" });
});

/**----------------------------------------------------------------
 *  @desc Login User
 *  @route /api/auth/login
 *  @method POST
 *  @access public
 -----------------------------------------------------------------*/
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  //TODO: 1. Validation
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //TODO: 2. check user exist on DB or not
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(400)
      .json({ message: "bad credintials, user doesn't exist" });
  }

  //TODO: 3. check password correctness
  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMatch) {
    return res
      .status(400)
      .json({ message: "bad credintials, user doesn't exist" });
  }

  //TODO: 4. sending email (verify account if not verified)

  //TODO: 5. generate token (JWT)
  const token = user.generateAuthToken();

  //TODO: 6. send a response to client
  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
  });
});
