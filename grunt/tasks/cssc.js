module.exports = (grunt, options) => {

  var project = options.project;

  return {
    options: grunt.file.readJSON('.csscrc'),
    optimize: {
      cwd: project.res.css.dir,
      src: ['*.css'],
      dest: project.res.css.dir,
      ext: '.min.css',
      expand: true
    }
  };

};
