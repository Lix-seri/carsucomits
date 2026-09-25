import type { NextConfig } from "next";
import { version } from "./package.json";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The footer shows the running version; package.json is the only place it lives.
  env: { APP_VERSION: version },
};

export default nextConfig;
