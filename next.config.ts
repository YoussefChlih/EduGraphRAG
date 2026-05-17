import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve(__dirname),
  },
  serverExternalPackages: ["unpdf", "pdfjs-dist"],
};

export default nextConfig;
