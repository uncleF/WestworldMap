/* jshint browser:true */

'use strict';

let eventTool = require('patterns/tx-event');

module.exports = (map, locations) => {

  let KEY_ACTIONS = {
    9: locations.toggle,
    37: map.rotateCCW,
    39: map.rotateCW,
    38: map.zoomIn,
    40: map.zoomOut
  };

  function onKeyDown(event) {
    let key = event.keyCode;
    if (KEY_ACTIONS[key]) {
      event.preventDefault();
      event.stopPropagation();
      KEY_ACTIONS[key]();
    }
  }

  eventTool.bind(document, 'keydown', onKeyDown);

};
