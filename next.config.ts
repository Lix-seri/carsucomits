import type { NextConfig } from "next";
import { version } from "./package.json";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The footer shows the running version; package.json is the only place it lives.
  env: { APP_VERSION: version },
  // Renamed routes (item 8): old bookmarks and shared links keep working.
  async redirects() {
    return [
      { source: "/commissioner", destination: "/hiring", permanent: true },
      { source: "/commissioner/:path*", destination: "/hiring/:path*", permanent: true },
      { source: "/admin/listings", destination: "/admin/commissions", permanent: true },
    ];
  },
};

export default nextConfig;
