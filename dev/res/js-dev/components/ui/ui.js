/* jshint browser:true */

'use strict';

let panel = require('./input/panel');
let keyboard = require('./input/keyboard');
let mouse = require('./input/mouse');
let touch = require('./input/touch');

let display = require('./elements/display');
let help = require('./elements/help');
let loader = require('./elements/loader');

module.exports = (locations, map) => {

  /* Input Options */

  panel();
  keyboard();
  mouse();
  touch();

  /* UI */

  display();
  help();
  loader.remove();

};
