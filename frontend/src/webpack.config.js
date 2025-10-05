const path = require('path')
const Dotenv = require('dotenv-webpack') // Tambahkan require dotenv-webpack

module.exports = {
  entry: './src/index.js', // Sesuaikan dengan entry point aplikasi React Anda
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new Dotenv(), // Menambahkan dotenv plugin
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
}
