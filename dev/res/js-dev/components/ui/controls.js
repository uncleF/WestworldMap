/* jshint browser:true */

'use strict';

let control = require('./control');
let toggle = require('./toggle');

const ROTATE_CCW_ID = 'rotateCCW';
const ROTATE_CW_ID = 'rotateCW';
const ZOOM_IN_ID = 'zoomIn';
const ZOOM_OUT_ID = 'zoomOut';
const FULL_SCREEN_ID = 'fullScreen';

module.exports = map => {

  function inititalizeControls() {
    control(ROTATE_CCW_ID, map.rotateCCW);
    control(ROTATE_CW_ID, map.rotateCW);
    control(ZOOM_IN_ID, map.zoomIn);
    control(ZOOM_OUT_ID, map.zoomOut);
    toggle(FULL_SCREEN_ID, map.toggleFullScreen);
  }

  inititalizeControls();

};
