const path = require('path');

const debugMode = (function () {
  const env = process.env.NODE_ENV;
  return env !== 'prod' && env !== 'production';
}());

const pkg = {};

pkg.src = {
  root: 'src',
  css:  'src/css',
  js:   'src/js',
  html: 'src',
};

pkg.dist = {
  root:   'dist',
  css:    'dist/css',
  js:     'dist/js',
  html:   'dist',
  vendor: 'dist/vendor',
};

const packageConfig = require('../package.json');
[pkg.name, pkg.version] = [packageConfig.name, packageConfig.version];

module.exports = { debugMode, pkg };
