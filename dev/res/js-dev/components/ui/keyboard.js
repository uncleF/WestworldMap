/* jshint browser:true */

'use strict';

let eventTool = require('patterns/tx-event');

module.exports = (map, locations) => {

  const KEY_ACTIONS = {
    32: locations.toggle,
    33: map.rotateCCW,
    34: map.rotateCW,
    37: map.panLeft,
    39: map.panRight,
    38: map.zoomIn,
    40: map.zoomOut,
    49: map.toggleTopView,
    50: map.togglePanorama
  };

  /* Interactions */

  function onKeyDown(event) {
    let key = event.keyCode;
    if (KEY_ACTIONS[key]) {
      event.preventDefault();
      event.stopPropagation();
      KEY_ACTIONS[key]();
    }
  }

  /* Initialization */

  eventTool.bind(document, 'keydown', onKeyDown);

};
