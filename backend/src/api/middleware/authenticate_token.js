import jwt from "jsonwebtoken";

// Middleware to Authenticate Access Token
const authenticateToken = (req, res, next) => {


  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token required" });


  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        // Token has expired
        return res.status(401).json({
          tokenExpired: true,
          message: "Token expired",
          expiredAt: err.expiredAt, // Optionally send the expiry time
        });
      } else {
        // Other token verification errors
        return res.status(403).json({ message: "Invalid token" });
      }
    }
    req.user = user;
    next();
  });
};

export default authenticateToken;
