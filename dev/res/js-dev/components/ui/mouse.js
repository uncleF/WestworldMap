/* jshint browser:true */

'use strict';

let eventTool = require('patterns/tx-event');

const CONTAINER_ID = 'locations';

const ROTATION_STEP = 0.005;

module.exports = map => {

  let container;

  let startPosition;
  let startAngle;

  function onMouseMove(event) {
    event.preventDefault();
    requestAnimationFrame(_ => {
      let currentPosition = event.clientX;
      let currentAngle = startAngle + (startPosition - currentPosition) * ROTATION_STEP;
      map.rotate(currentAngle);
    });
  }

  function onMouseUp() {
    eventTool.unbind(document, 'mousemove', onMouseMove);
    eventTool.unbind(document, 'mouseup', onMouseUp);
  }

  function initializeMouseMove() {
    eventTool.bind(document, 'mousemove', onMouseMove);
    eventTool.bind(document, 'mouseup', onMouseUp);
  }

  function onMouseDown(event) {
    event.preventDefault();
    startPosition = event.clientX;
    startAngle = map.angle();
    initializeMouseMove();
  }

  container = document.getElementById(CONTAINER_ID);
  eventTool.bind(document, 'mousedown', onMouseDown);

};
