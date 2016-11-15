module.exports = (grunt, options) => {

  var project = options.project;

  return {
    test: {
      cwd: project.res.js.devDir,
      src: [
        '*.js',
        `${project.res.js.comp.replace(project.dir, '')}/**/*.js`
      ],
      expand: true
    }
  };

};
