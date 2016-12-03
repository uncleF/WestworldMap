/* jshint browser:true */

'use strict';

let panel = require('ui/input/panel');
let keyboard = require('ui/input/keyboard');
let mouse = require('ui/input/mouse');
let touch = require('ui/input/touch');

let display = require('ui/elements/display');
let help = require('ui/elements/help');
let loader = require('ui/elements/loader');
let error = require('ui/elements/error');

exports.error = error.show;

exports.init = (locations, map) => {

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
