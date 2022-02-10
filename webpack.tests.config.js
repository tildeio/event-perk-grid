/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: process.env.TESTEM
        ? './tests/testem.html'
        : './tests/index.html',
      inject: 'head',
      scriptLoading: 'blocking',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'tests/mockServiceWorker.js',
        },
      ],
    }),
    new Dotenv({
      path: './.env.test',
      safe: true,
      systemvars: true,
    }),
  ],
  devtool: 'source-map',
  devServer: {},
};
