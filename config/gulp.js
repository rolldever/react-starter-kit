const path = require('path');

const gulp = require('gulp');
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

gulp.task('vendor', function () {
  const {location, libs} = require('./vendor');
  libs.forEach(obj => {
    const src = `${location[obj.type]}/${obj.lib}/${obj.src}`;
    const src2 = path.join(location[obj.type], obj.lib) + path.sep + obj.src;
    const dest = obj.dest || path.join(pkg.dist.vendor, obj.lib);
    gulp.src(src).pipe(gulp.dest(dest));
  });
});

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
  const include = ['**/*.txt', '**/*.json', '**/*.xml', '**/*.ico'];
  const src = include.map(g => `${pkg.src.root}/${g}`)
    .concat(`!${pkg.src.root}/img/**/*`, `!${pkg.src.root}/font/**/*`);
  gulp.src(src)
    .pipe(cache('other-files'))
    .pipe(gulp.dest(pkg.dist.root));

  gulp.src(`${pkg.src.root}/{img,font}/**`)
    .pipe(gulp.dest(pkg.dist.root));
});

gulp.task('js', function (callback) {
  webpack(webpackSettings, (err, stats) => {
    if (err) throw new gutil.PluginError('js', err);
    gutil.log('[js]', stats.toString({ colors: true }));
    callback();
  });
});


gulp.task('build', ['html', 'js', 'other-files']);


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
      `${pkg.dist.css}/**/*.css`,
      `${pkg.dist.html}/**/*.html`,
    ],
  });
});
