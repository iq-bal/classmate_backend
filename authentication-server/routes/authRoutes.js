import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";
import User from "../models/userModel.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  const { name, password, email, role } = req.body;
  try {
    if (!name || !password || !email || !role) {
      return res.status(400).json({ message: "Some fields are missing" });
    }

    const userExists = await User.findOne({ email });

    console.log(userExists);
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      uid: uuidv4(),
      name,
      email,
      role,
      password: hashedPassword,
    };

    await User.create(newUser);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password);
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Some fields are missing" });
    }

    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await redisClient.setEx(
      `refreshToken:${user.email}`,
      7 * 24 * 3600,
      refreshToken
    );
    res.json({ uid:user.uid,name:user.name,email:user.email,role:user.role,accessToken, refreshToken});
  } catch (error) {
    console.error("Error in /login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Token Refresh Route
router.post("/token", async (req, res) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token is required" });
    }

    const email = jwt.decode(refreshToken).email;
    const storedRefreshToken = await redisClient.get(`refreshToken:${email}`);

    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const newAccessToken = generateAccessToken(user);
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Error in /token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout Route
router.delete("/logout", async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const email = decoded.email;
    
    const result = await redisClient.del(`refreshToken:${email}`);

    if (result === 0) {
      return res.status(404).json({ message: "Refresh token not found" });
    }
    
    console.log("Logged out successfully");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in /logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
