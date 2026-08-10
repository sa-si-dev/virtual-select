const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const UnminifiedWebpackPlugin = require('unminified-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const { version } = require('./package.json');

const banner = `Virtual Select v${version}
https://sa-si-dev.github.io/virtual-select
Licensed under MIT (https://github.com/sa-si-dev/virtual-select/blob/master/LICENSE)`;

module.exports = (env, options) => {
  const onStartEventOptions = {};

  if (options.mode === 'production') {
    onStartEventOptions.delete = ['dist'];
  }

  const config = {
    target: 'es5',

    entry: {
      'styles': ['./src/styles.js', './node_modules/popover-plugin/dist/popover.min.css'],
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
          onStart: onStartEventOptions,
          onEnd: {
            delete: ['dist/styles.min.js', 'dist/styles.js', 'dist/virtual-select.css'],
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

        new UnminifiedWebpackPlugin(),
      ],
    },

    module: {
      rules: [
        {
          test: /\.scss$/,
          exclude: /(node_modules)/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  /**
                   * Dart Sass prepends an encoding hint whenever the output contains a non-ASCII
                   * character - `@charset "UTF-8";` in expanded output, and a U+FEFF BOM in the
                   * compressed output we ship. BannerPlugin then prepends the licence banner in
                   * front of it, so the BOM lands mid-file, where U+FEFF is a valid CSS ident
                   * code point rather than an ignorable mark: the parser reads it as the start of
                   * a selector, swallows the rule that follows and drops the pair.
                   *
                   * That silently deleted `@keyframes vscomp-animation-spin` - the first rule
                   * after the banner - while `.vscomp-options-loader::before` kept referencing it,
                   * so the options loader rendered frozen. Any first rule is vulnerable; the
                   * spinner was only the one that happened to be there.
                   *
                   * The stylesheet is ASCII (the `\26A0` cue is emitted as an escape, see
                   * virtual-select.scss), so there is no encoding to declare and nothing is lost
                   * by suppressing the hint. Kept as a rule rather than relying on the source
                   * staying ASCII, so a future non-ASCII character cannot resurrect the BOM.
                   */
                  charset: false,
                },
              },
            },
          ],
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
