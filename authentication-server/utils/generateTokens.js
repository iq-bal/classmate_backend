import jwt from "jsonwebtoken";

// Generate Access Token
function generateAccessToken(user) {
    return jwt.sign(
      { uid: user.uid, name: user.name, role:user.role, email:user.email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_LIFETIME,
      }
    );
  }
  
  // Generate Refresh Token
  function generateRefreshToken(user) {
    return jwt.sign(
      { uid: user.uid, name: user.name, role:user.role, email:user.email },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_LIFETIME,
      }
    );
  }

export { generateAccessToken, generateRefreshToken };
