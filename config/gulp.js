const path = require('path');

const gulp = require('gulp');
const del = require('del');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const cache = require('gulp-cached');
const htmlMinifier = require('gulp-html-minifier');

const browserSync = require('browser-sync');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');


const {debugMode, pkg} = require('./env');
const webpackSettings = require('./webpack');
const bundler = webpack(webpackSettings);

gulp.task('copy-libs', function () {});

gulp.task('html', function () {
  return gulp.src(`${pkg.src.html}/**/*.html`)
    .pipe(cache('html'))
    .pipe(htmlMinifier({
      collapseWhitespace: true,
      removeComments:     true,
    }))
    .pipe(gulp.dest(pkg.dist.html));
});

gulp.task('other-files', function () {
  const globs = ['**/*.txt', '**/*.json', '**/*.xml'];
  return gulp.src(globs.map(g => `${pkg.src.root}/${g}`))
    .pipe(cache('other-files'))
    .pipe(gulp.dest(pkg.dist.root));
});

gulp.task('js', function (callback) {
  webpack(webpackSettings, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('js', err);
    }
    gutil.log('[js]', stats.toString({ colors: true }));
    callback();
  });
});


gulp.task('build', ['html', 'js', 'other-files']);

gulp.task('clean', function () {
  return del([
    '.sass-cache',
    'dist/**/*',
    '!dist/img',
    '!dist/font',
  ]);
});


gulp.task('watch', ['html', 'other-files'], function (callback) {
  gulp.watch(`${pkg.src.html}/**/*.html`, ['html']);

  browserSync({
    server: {
      baseDir: [pkg.dist.root],

      middleware: [
        webpackDevMiddleware(bundler, {
          publicPath: webpackSettings.output.publicPath,
          stats: { colors: true },
        }),
        webpackHotMiddleware(bundler),
      ],
    },

    files: [
      pkg.dist.css + '/**/*.css',
      pkg.dist.html + '/**/*.html',
    ],
  });
});
