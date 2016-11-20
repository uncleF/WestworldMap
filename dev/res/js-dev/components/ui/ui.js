/* jshint browser:true */

'use strict';

let control = require('./control');
let toggle = require('./toggle');
let display = require('./display');
let keyboard = require('./keyboard');
let mouse = require('./mouse');
let touch = require('./touch');
let help = require('./help');

const WESTWORLD_ID = 'westworld';
const LOCATIONS_ID = 'showLocations';
const PANORAMA_ID = 'panorama';
const ROTATE_CCW_ID = 'rotateCCW';
const ROTATE_CW_ID = 'rotateCW';
const ZOOM_IN_ID = 'zoomIn';
const ZOOM_OUT_ID = 'zoomOut';
const RESET_ID = 'reset';
const TOP_DOWN_ID = 'topDown';
const FULL_SCREEN_ID = 'fullScreen';
const HELP_ID = 'help';

module.exports = (map, locations) => {

  function inititalizeControlPanel() {
    toggle(WESTWORLD_ID, _ => {});
    toggle(LOCATIONS_ID, locations.toggle);
    toggle(PANORAMA_ID, map.panorama);
    control(ROTATE_CCW_ID, map.rotateCCW);
    control(ROTATE_CW_ID, map.rotateCW);
    control(ZOOM_IN_ID, map.zoomIn);
    control(ZOOM_OUT_ID, map.zoomOut);
    control(RESET_ID, map.reset);
    toggle(TOP_DOWN_ID, map.topDown);
    toggle(FULL_SCREEN_ID, display.toggle);
    control(HELP_ID, help.toggle);
  }

  inititalizeControlPanel();
  keyboard(map, locations);
  mouse(map);
  touch(map);

};
