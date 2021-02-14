const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');

const banner = `Virtual Select v1.0.4
https://sa-si-dev.github.io/virtual-select
Licensed under MIT (https://github.com/sa-si-dev/virtual-select/blob/master/LICENSE)`;

module.exports = (env, options) => {
  const config = {
    entry: {
      styles: './src/styles.js',
      'virtual-select': './src/virtual-select.js',
    },

    output: {
      filename: '[name].min.js',
      path: path.resolve(__dirname, 'dist'),
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: 'virtual-select.min.css',
      }),

      new webpack.BannerPlugin(banner),

      new FileManagerPlugin({
        events: {
          onStart: {
            delete: [
              'dist',
            ]
          },
          onEnd: {
            delete: [
              'dist/styles.min.js',
            ],
            copy: [
              { source: 'static', destination: 'dist' },
              { source: 'static', destination: 'docs/assets' },
              { source: 'dist', destination: 'docs/assets' },
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
