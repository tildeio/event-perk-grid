const path = require('path');
// eslint-disable-next-line import/no-extraneous-dependencies
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// eslint-disable-next-line import/no-extraneous-dependencies
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
  ],
  devtool: 'eval-source-map',
  devServer: {},
};
