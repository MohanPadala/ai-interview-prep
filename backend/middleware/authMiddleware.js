const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (Format: "Bearer eyJhbG...")
      token = req.headers.authorization.split(" ")[1];

      // Verify token signature against our JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by decoded ID, excluding the password field
      req.user = await User.findById(decoded.userId).select("-password");

      next(); // Proceed to the actual route controller
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };