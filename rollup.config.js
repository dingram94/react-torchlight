import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";

// Define entry points - main library and plugins
const entries = {
  index: "src/index.tsx",
  "plugins/typescript": "src/plugins/typescript.ts",
  "plugins/vite": "src/plugins/vite.ts",
};

// Separate CSS entry
const cssEntry = {
  input: "src/style.css",
  output: {
    file: "dist/css/styles.css",
  },
  plugins: [
    postcss({
      extract: true,
      minimize: true,
    }),
  ],
};

// Create output configurations for each entry
const outputs = Object.entries(entries).map(([name, input]) => {
  const isPlugin = name.startsWith("plugins/");

  return {
    input,
    output: [
      {
        file: `dist/${name}.${isPlugin ? "esm" : "esm"}.js`,
        format: "esm",
        sourcemap: process.env.NODE_ENV !== "production",
        exports: "named",
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        browser: !isPlugin,
        preferBuiltins: isPlugin,
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.rollup.json",
      }),
    ],
    external: isPlugin
      ? ["fs", "path", "vite", "typescript"]
      : ["react", "react-dom", "react/jsx-runtime"],
  };
});

export default [...outputs, cssEntry];
