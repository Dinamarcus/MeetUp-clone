import path from "path";

export default {
  mode: "development",
  entry: { app: "./src/js/app.js"},
  output: {
    filename: "[name].js",
    path: path.resolve("public/js"),
  },
};
