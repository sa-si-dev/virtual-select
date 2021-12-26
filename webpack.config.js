const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const { version } = require('./package.json');

const banner = `Virtual Select v${version}
https://sa-si-dev.github.io/virtual-select
Licensed under MIT (https://github.com/sa-si-dev/virtual-select/blob/master/LICENSE)`;

module.exports = (env, options) => {
  const config = {
    target: 'es5',

    entry: {
      styles: ['./src/styles.js', './node_modules/popover-plugin/dist/popover.min.css'],
      'virtual-select': ['./src/virtual-select.js', './node_modules/popover-plugin/dist/popover.min.js'],
    },

    output: {
      filename: '[name].min.js',
      path: path.resolve(__dirname, 'dist'),
      chunkFormat: 'array-push',
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: 'virtual-select.min.css',
      }),

      new webpack.BannerPlugin(banner),

      new FileManagerPlugin({
        events: {
          onStart: {
            delete: ['dist'],
          },
          onEnd: {
            delete: ['dist/styles.min.js'],
            copy: [
              { source: 'node_modules/tooltip-plugin/dist', destination: 'docs/assets' },
              { source: 'dist', destination: 'docs/assets' },
              { source: 'dist/virtual-select.min.js', destination: `dist-archive/virtual-select-${version}.min.js` },
              { source: 'dist/virtual-select.min.css', destination: `dist-archive/virtual-select-${version}.min.css` },
            ],
          },
        },
      }),
    ],

    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false,
        }),
      ],
    },

    module: {
      rules: [
        {
          test: /\.scss$/,
          exclude: /(node_modules)/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
  };

  if (options.mode === 'development') {
    config.devtool = 'inline-source-map';
  }

  return config;
};
