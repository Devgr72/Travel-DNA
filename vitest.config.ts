import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/lib/__tests__/**/*.test.ts",
      "src/app/api/__tests__/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts", "src/app/api/**/route.ts"],
      exclude: ["src/lib/__tests__/**", "src/app/api/__tests__/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
