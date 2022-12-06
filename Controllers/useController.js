const asyncHandler = require("express-async-handler");
const generateToken = require("../Config/generateToken");
const User = require("../Model/userModel");

//Router for Sign up
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exist");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Fail to create User");
  }
});

// Log in Router
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const comparePassword = await user.matchPassword(password);

  if (user && comparePassword) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  }
});

//for search user like /api/user?search=ramkrushna
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
          
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } }).select('-password');
  res.send(users);
});

module.exports = { registerUser, authUser, allUsers };
