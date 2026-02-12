import {defineConfig, mergeConfig} from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/main.tsx", "src/test/**", "src/types/**", "src/styles/tokens.ts", "src/styles/mixins.ts"],
        thresholds: {lines: 100, functions: 100, branches: 100, statements: 100},
      },
    },
  }),
);
