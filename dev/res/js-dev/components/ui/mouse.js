/* jshint browser:true */

'use strict';

let eventTool = require('patterns/tx-event');

const CATCHER_ID = 'locations';

const ROTATION_STEP = 0.005;
const SCALE_STEP = 0.01;

module.exports = map => {

  let catcher;

  let startPosition;
  let startRotation;

  /* Interactions */

  function onMouseMove(event) {
    event.preventDefault();
    requestAnimationFrame(_ => {
      let currentPosition = event.clientX;
      let currentAngle = startRotation[1] + (startPosition - currentPosition) * ROTATION_STEP;
      let currentRotation = [startRotation[0], currentAngle, startRotation[2]];
      map.rotate(currentRotation);
    });
  }

  function onMouseUp() {
    eventTool.unbind(document, 'mousemove', onMouseMove);
    eventTool.unbind(document, 'mouseup', onMouseUp);
  }

  function onMouseDown(event) {
    event.preventDefault();
    startPosition = event.clientX;
    startRotation = map.getRotation();
    eventTool.bind(document, 'mousemove', onMouseMove);
    eventTool.bind(document, 'mouseup', onMouseUp);
  }

  function onWheel(event) {
    event.preventDefault();
    event.stopPropagation();
    let startScale = map.getScale();
    let deltaScale = event.deltaY > 0 ? SCALE_STEP : -SCALE_STEP;
    map.zoom(startScale + deltaScale * 2);
  }

  /* Inititalization */

  catcher = document.getElementById(CATCHER_ID);
  eventTool.bind(catcher, 'mousedown', onMouseDown);
  eventTool.bind(catcher, 'wheel', onWheel);
  return Promise.resolve();

};
