const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const banner = `Virtual Select 1.0
https://sa-si-dev.github.io/virtual-select
Licensed under MIT (https://github.com/sa-si-dev/virtual-select/blob/main/LICENSE)`;

module.exports = (env, options) => {
  return {
    entry: {
      styles: './src/styles.js',
      'virtual-select': './src/virtual-select.js',
    },
  
    output: {
      filename: '[name].min.js',
      path: path.resolve(__dirname, 'dist')
    },
  
    devtool: options.mode === 'development' ? 'inline-source-map' : 'none',
  
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'virtual-select.min.css'
      }),

      new CleanWebpackPlugin(
        {
          protectWebpackAssets: false,
          cleanAfterEveryBuildPatterns: ['main.min.js', 'styles.min.js']
        }
      ),

      new webpack.BannerPlugin(banner)
    ],
  
    module: {
      rules: [
        {
          test: /\.scss$/,
          exclude: /(node_modules)/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        },
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }
      ]
    }
  };
};