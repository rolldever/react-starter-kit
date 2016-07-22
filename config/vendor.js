module.exports = {
  location: {
    npm:   'node_modules',
    bower: 'bower_components',
  },

  libs: [
    {
      type: 'npm',
      lib:  'emojione',
      src:  'assets/{css,svg}/**/*',
    },
  ],
};
