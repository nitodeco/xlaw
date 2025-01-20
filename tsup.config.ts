import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
  splitting: false,
  outDir: "dist",
  name: "xlaw",
  minify: false,
  sourcemap: true,
  keepNames: true,
  target: "node18",
  noExternal: ["*"],
});
