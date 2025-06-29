// import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", "build"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "build/",
        "**/*.d.ts",
        "**/*.config.{js,ts}",
        "**/index.ts",
      ],
    },
  },
  // resolve: {
  //   alias: {
  //     "@": path.resolve(__dirname, "./src"),
  //   },
  // },
});
