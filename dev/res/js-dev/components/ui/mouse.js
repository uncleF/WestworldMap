/* jshint browser:true */

'use strict';

let eventTool = require('patterns/tx-event');

const CATCHER_ID = 'locations';

const PAN_STEP = 0.25;

const ROTATION_STEP = -0.005;

const SCALE_STEP = 0.01;

module.exports = map => {

  let catcher;

  let startPosition;
  let startRotation;

  const MOUSE_ACTIONS = {
    0: onLeftMouseMove,
    2: onRightMouseMove
  };

  /* Interactions */

  function onLeftMouseMove(event) {
    event.preventDefault();
    requestAnimationFrame(_ => {
      let currentPosition = event.clientX;
      let currentAngle = startRotation[1] + (currentPosition - startPosition) * ROTATION_STEP;
      let currentRotation = [startRotation[0], currentAngle, startRotation[2]];
      map.rotate(currentRotation);
    });
  }

  function onRightMouseMove(event) {
    event.preventDefault();
    requestAnimationFrame(_ => {
      let currentDistance = (event.clientX - startPosition) * PAN_STEP;

      map.pan(currentDistance);
    });
  }

  function onMouseUp(event) {
    eventTool.unbind(document, 'mousemove', MOUSE_ACTIONS[event.button]);
    eventTool.unbind(document, 'mouseup', onMouseUp);
  }

  function onMouseDown(event) {
    event.preventDefault();
    startPosition = event.clientX;
    startRotation = map.getRotation();
    map.snapshot();
    eventTool.bind(document, 'mousemove', MOUSE_ACTIONS[event.button]);
    eventTool.bind(document, 'mouseup', onMouseUp);
  }

  function onWheel(event) {
    event.preventDefault();
    let startScale = map.getScale();
    let deltaScale = event.deltaY > 0 ? SCALE_STEP : -SCALE_STEP;
    map.zoom(startScale + deltaScale * 2);
  }

  function onContextMenu(event) {
    event.preventDefault();
  }

  /* Inititalization */

  catcher = document.getElementById(CATCHER_ID);
  eventTool.bind(catcher, 'mousedown', onMouseDown);
  eventTool.bind(catcher, 'wheel', onWheel);
  eventTool.bind(catcher, 'contextmenu', onContextMenu);
  return Promise.resolve();

};
