// config/redis.js
import { createClient } from "redis";

const redisClient = createClient();

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis Connected");
  } catch (error) {
    console.error("Redis Connection Error:", error);
    process.exit(1);
  }
};

export { redisClient, connectRedis };
