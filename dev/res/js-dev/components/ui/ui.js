/* jshint browser:true */

'use strict';

let panel = require('./input/panel');
let keyboard = require('./input/keyboard');
let mouse = require('./input/mouse');
let touch = require('./input/touch');

let display = require('./display');
let help = require('./help');

module.exports = (locations, map) => {

  /* Input Options */

  panel();
  keyboard();
  mouse();
  touch();

  /* UI */

  display();
  help();

};
