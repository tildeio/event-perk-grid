/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
/* eslint-enable import/no-extraneous-dependencies */

module.exports = {
  entry: './tests/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: { configFile: 'tsconfig.tests.json' },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'tests.js',
    path: path.resolve(__dirname, 'tmp', 'tests'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: process.env.TESTEM
        ? './tests/testem.html'
        : './tests/index.html',
      inject: 'head',
      scriptLoading: 'blocking',
    }),
    new Dotenv({ path: './.env.development', safe: true, systemvars: true }),
  ],
  devtool: 'source-map',
  devServer: {},
};
