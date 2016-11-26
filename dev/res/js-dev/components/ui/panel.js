/* jshint browser:true */

'use strict';

let control = require('./control');
let toggle = require('./toggle');

const LOCATIONS_ID = 'showLocations';
const TOP_DOWN_ID = 'showTopDown';
const ROTATE_CCW_ID = 'rotateCCW';
const ROTATE_CW_ID = 'rotateCW';
const ZOOM_IN_ID = 'zoomIn';
const ZOOM_OUT_ID = 'zoomOut';
const RESET_ID = 'reset';
const FULL_SCREEN_ID = 'fullScreen';
const HELP_ID = 'showHelp';

// const WESTWORLD_ID = 'westworld';
// const PANORAMA_ID = 'showPanorama';

module.exports = (map, locations, display, help) => {

  /* Panel Initialization */

  toggle(LOCATIONS_ID, locations.toggle);
  toggle(TOP_DOWN_ID, map.toggleTopView);
  control(ROTATE_CCW_ID, map.rotateCCW);
  control(ROTATE_CW_ID, map.rotateCW);
  control(ZOOM_OUT_ID, map.zoomOut);
  control(ZOOM_IN_ID, map.zoomIn);
  control(RESET_ID, map.reset);
  toggle(FULL_SCREEN_ID, display.toggle);
  control(HELP_ID, help.toggle);

  // toggle(WESTWORLD_ID, _ => {});
  // toggle(PANORAMA_ID, map.togglePanorama);

};
