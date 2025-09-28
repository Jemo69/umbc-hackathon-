import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Turbopack uses this project as the root. This avoids picking up a
  // different workspace root when multiple lockfiles exist higher up.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
