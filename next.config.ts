import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // 관리자가 업로드한 상품 이미지 (Supabase Storage)
    remotePatterns: [
      new URL("https://xyadjephgznrdekesqfp.supabase.co/storage/v1/object/public/**"),
    ],
  },
};

export default nextConfig;
