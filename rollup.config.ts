import typescript from "@rollup/plugin-typescript";
import dotenv from "rollup-plugin-dotenv"


export default {
  input: "src/main.ts",
  output: {
    file: "dist/worker.js",
    format: "cjs",
  },
  cache: false,
  plugins: [typescript(), dotenv()],
};
