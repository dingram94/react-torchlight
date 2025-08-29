import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { terser } from "rollup-plugin-terser";

// Define all entry points
const entries = {
  // Main library
  index: "src/index.tsx",
  // Context
  context: "src/context.tsx",
  // Plugins
  "plugins/typescript": "src/plugins/typescript.ts",
  "plugins/vite": "src/plugins/vite.ts",
  // Types
  types: "src/types.ts",
};

// Create output configurations for each entry
const outputs = Object.entries(entries).map(([name, input]) => ({
  input,
  output: [
    {
      file: `dist/${name}.js`,
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: `dist/${name}.esm.js`,
      format: "esm",
      sourcemap: true,
      exports: "named",
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    terser(),
  ],
  external: ["react", "react-dom"],
}));

export default outputs;
