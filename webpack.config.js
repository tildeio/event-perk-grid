const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
      library: { type: 'module' },
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
    clean: true,
  },
  plugins: [
    new Dotenv({
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      path: `./.env.${mode}`,
      safe: true,
      systemvars: true,
    }),
    new CopyWebpackPlugin({
      // FIXME: This isn't copying to the right place, need to add to pkg.json, etc
      patterns: [
        {
          from: 'src/*.css',
        },
      ],
    }),
  ],
  devtool: 'inline-source-map',
});
