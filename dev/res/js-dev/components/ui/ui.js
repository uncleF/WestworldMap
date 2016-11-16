/* jshint browser:true */

'use strict';

let drawer = require('./drawer');
let controls = require('./controls');

module.exports = map => {

  drawer();
  controls(map);

};
