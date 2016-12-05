/* jshint browser: true */
/* global Modernizr */

'use strict';

let es6Promise = require('es6-promise');

module.exports = _ => {

  if (!Modernizr.promises) {
    es6Promise.polyfill();
  }

};
