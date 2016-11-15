module.exports = (grunt, options) => {

  var project = options.project;

  return {
    bundle: {
      options: {
        transform: [['babelify', {'presets': ['es2015']}]],
        browserifyOptions: {
          paths: [project.res.js.comp]
        }
      },
      cwd: project.res.js.devDir,
      src: ['*.js', `!${project.res.js.service}.js`],
      dest: project.res.js.dir,
      expand: true
    }
  };

};
