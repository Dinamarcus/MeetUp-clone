import path from "path";

export default {
  mode: "development",
  entry: { app: "./src/js/app.js"},
  output: {
    filename: "[name].js",
    path: path.resolve("public/js"),
  },
  module: {
    rules: [    
      {
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'] // conjuntl de plugins que utiliza babel para convertir el codigo de ES6 a versiones anteriores
          }
        }
      }
    ] 
  }
};
