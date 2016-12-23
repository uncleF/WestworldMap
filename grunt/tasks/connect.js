module.exports = (grunt, options) => {

  var project = options.project;

  return {
    options: {
      keepalive: true,
      port: 8000,
      debug: true
    },
    dev: {
      options: {
        base: project.dir
      }
    },
    build: {
      options: {
        base: project.build.dir
      }
    }
  };

};
