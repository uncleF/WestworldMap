var CONFIG = {

  PROJECT: 'WestworldMap',          // Project Name
  LANGUAGE: 'ru',                // Language
  BROWSERS: [                    // Browser Support
    '> 1%',
    'last 2 versions',
    'Firefox ESR',
    'Opera 12.1',
    'Explorer >= 8'
  ],

  DEVELOPMENT_DIR: 'dev',        // Development
  BUILD_DIR: 'build',            // Build
  META_DIR: 'meta',              // Meta Content
  TESTS_DIR: 'tests',            // Tests

  IMAGES_DIR: 'images',          // Content Images

  RESOURCES_DIR: 'res',          // Resources
  COMPONENTS_DIR: 'components',  // Components

  TEMPLATES_DIR: 'templates',    // Templates
  INDEX_PAGE: 'index.html',      // Index Page
  CRITICAL_DESK_W: 1280,         // Critical Width on Desktop
  CRITICAL_DESK_H: 800,          // Critical Height on Desktop
  CRITICAL_MOBILE_W: 320,        // Critical Width on Mobile
  CRITICAL_MOBILE_H: 640,        // Critical Height on Mobile

  CSS_IMAGES_DIR: 'images',      // CSS Images
  SPRITES: [                     // CSS Images that Should be Compiled into Separate Sprite Sheets
    'sprites.png'
  ],
  DATA_URI: [],                  // CSS Images that Should be Converted into DataURI
  DENSITIES: [1, 2, 3],          // Pixel Densities

  SASS_DIR: 'sass',              // Sass
  CSS_DIR: 'css',                // CSS
  CSS_FILENAME: 'styles',        // CSS Filename

  JS_DEV_DIR: 'js-dev',          // Development JavaScript
  JS_DIR: 'js',                  // JavaScript
  JS_BUNDLE: 'scripts',          // JavaScript Filename
  JS_SERVICE: 'service',         // JavaScript Filename

  FONTS_DIR: 'fonts'             // Fonts

}

module.exports = function(grunt) {

  var loadConfig = require('load-grunt-config');
  var configPath = `${process.cwd()}/grunt/tasks/`
  var staticMappings = require('./grunt/tx/tx-mapping');
  var data = require('./grunt/tx/tx-config')(CONFIG);

  loadConfig(grunt, {configPath: configPath, jitGrunt: {staticMappings: staticMappings}, data: data});
  loadConfig(grunt, {jitGrunt: true, init: false, data: data });

};
