/* jshint browser:true */

'use strict';

let control = require('./control');
let toggle = require('./toggle');
let uiEvents = require('ui/uiEvents');
let mapEvents = require('map/mapEvents');

const LOCATIONS_ID = 'showLocations';
const TOP_DOWN_ID = 'showTopDown';
const ROTATE_CCW_ID = 'rotateCCW';
const ROTATE_CW_ID = 'rotateCW';
const ZOOM_IN_ID = 'zoomIn';
const ZOOM_OUT_ID = 'zoomOut';
const RESET_ID = 'reset';
const FULL_SCREEN_ID = 'fullScreen';
const HELP_SHOW_ID = 'showHelp';
const HELP_CLOSE_ID = 'closeHelp';

module.exports = _ => {
  toggle(LOCATIONS_ID, uiEvents.locations, mapEvents.locations);
  toggle(TOP_DOWN_ID, uiEvents.topDown, mapEvents.topDown);
  control(ROTATE_CCW_ID, uiEvents.rotateCCW);
  control(ROTATE_CW_ID, uiEvents.rotateCW);
  control(ZOOM_OUT_ID, uiEvents.zoomOut);
  control(ZOOM_IN_ID, uiEvents.zoomIn);
  control(RESET_ID, uiEvents.reset);
  toggle(FULL_SCREEN_ID, uiEvents.fullscreen, mapEvents.fullscreen);
  control(HELP_SHOW_ID, uiEvents.help);
  control(HELP_CLOSE_ID, uiEvents.help);
};
