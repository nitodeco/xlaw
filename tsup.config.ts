import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  outDir: "dist",
  name: "xlaw",
  minify: false,
  treeshake: true,
  splitting: true,
  sourcemap: false,
  keepNames: true,
  target: "node18",
});
