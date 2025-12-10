import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
      "@core": "/src/core",
      "@config": "/src/config",
      "@shared": "/src/shared",
      "@infrastructure": "/src/infrastructure",
      "@presentation": "/src/presentation",
      "@prisma/client": "/src/generated/prisma",
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/tests/**/*.test.ts"], // aqui é importante
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.config.ts",
        "src/infra/repositories/*InMemory.ts",
        "src/infra/db/**",
      ],
    },
  },
});
