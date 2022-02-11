const path = require('path');
const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = (env, { mode }) => ({
  experiments: {
    outputModule: true,
  },
  entry: {
    index: {
      import: './src/index.ts',
      library: { type: 'module' },
    },
    'custom-element': {
      import: './src/custom-element.ts',
      library: { type: 'var', name: 'PerkGrid' },
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new Dotenv({
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      path: `./.env.${mode}`,
      safe: true,
      systemvars: true,
    }),
    new MiniCssExtractPlugin(),
  ],
  optimization: {
    minimizer: [`...`, new CssMinimizerPlugin()],
  },
  devtool: 'inline-source-map',
});
