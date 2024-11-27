import type { NextConfig } from "next";
import dotenv from "dotenv";
import { env } from "process";

dotenv.config();

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    ANTHROPIC_TEST_API_KEY: process.env.ANTHROPIC_TEST_API_KEY,
    MONGODB_URI: process.env.MONGODB_URI
  }
};

export default nextConfig;
