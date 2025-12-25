const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_AUTH_KEY,
    { expiresIn: "24h" }
  );
};

module.exports = generateToken;
