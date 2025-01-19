import jwt from "jsonwebtoken";

const authenticateToken = (req) => {
  const authHeader = req.headers["authorization"];
  
  const token = authHeader && authHeader.split(" ")[1];


  // console.log("token", token);
  if (!token) {
    throw new Error("Token required");
  }

  try {
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return user; // Return the authenticated user
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Token expired");
    } else {
      throw new Error("Invalid token");
    }
  }
};

export default authenticateToken;
