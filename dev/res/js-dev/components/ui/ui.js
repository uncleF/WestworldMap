/* jshint browser:true */

'use strict';

let display = require('./display');
let panel = require('./panel');
let keyboard = require('./keyboard');
let mouse = require('./mouse');
let touch = require('./touch');
let help = require('./help');

module.exports = (locations, map) => {

  /* UI Initialization */

  panel(map, locations, display, help);
  keyboard(map, locations);
  mouse(map);
  touch(map);

};
