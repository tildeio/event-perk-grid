const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

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
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new Dotenv({
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      path: `./.env.${mode}`,
      safe: true,
      systemvars: true,
    }),
  ],
  devtool: 'inline-source-map',
});
