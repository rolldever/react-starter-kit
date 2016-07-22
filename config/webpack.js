const webpack = require('webpack');
const path = require('path');

const {debugMode, pkg} = require('./env');


const cwd = process.cwd();
const srcPath = path.join(cwd, pkg.src.js);
const distPath = path.join(cwd, pkg.dist.js);

// Babel loaders
const babelLoaders = (function () {
  const presets = ['react', 'es2015', 'stage-0'];
  const plugins = ['react-html-attrs', 'transform-class-properties', 'transform-decorators-legacy'];

  const presetsQuery = presets.map(p => `presets[]=${p}`).join(',');
  const pluginsQuery = plugins.map(p => `plugins[]=${p}`).join(',');
  const query = [presetsQuery, pluginsQuery].join(',');

  return [`babel?${query}`];
}());

if (debugMode) {
  // Only hot load on debug mode
  babelLoaders.push('webpack-module-hot-accept');
  babelLoaders.unshift('react-hot');
}

const plugins = (function () {
  const dedup = new webpack.optimize.DedupePlugin();
  const occurenceOrder = new webpack.optimize.OccurenceOrderPlugin();
  const noErrors = new webpack.NoErrorsPlugin();
  const hotModuleReplacement = new webpack.HotModuleReplacementPlugin();
  const uglifyJS = new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false },
    output: { comments: false },
    mangle: false,
    sourcemap: false,
  });
  const define = new webpack.DefinePlugin({
    'process.env': { 'NODE_ENV': JSON.stringify('production') },
  });

  if (debugMode) {
    return [occurenceOrder, noErrors, hotModuleReplacement];
  }
  return [dedup, occurenceOrder, uglifyJS, define];
}());

const webpackSettings = {
  context: srcPath,
  debug: debugMode,
  plugins,

  entry: {
    app: [
      path.join(srcPath, './app.jsx'),
    ],
  },

  output: {
    path: distPath,
    publicPath: '/js/',
    filename: '[name].js',
  },

  resolve: {
    extensions: ['', '.js', '.jsx'],
  },

  module: {
    loaders: [{
      test: /\.jsx$/,
      exclude: /(?:node_modules|bower_components)/,
      include: [srcPath],
      loaders: babelLoaders,
    }],
  },
};

// debug mode settings
if (debugMode) {
  webpackSettings.devtool = 'inline-sourcemap';

  for (const key in webpackSettings.entry) {
    if (webpackSettings.entry.hasOwnProperty(key)) {
      webpackSettings.entry[key].unshift('webpack-hot-middleware/client');
      webpackSettings.entry[key].unshift('webpack/hot/dev-server');
    }
  }
}

module.exports = webpackSettings;
