/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');

function onClick(event, uiEvent) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.trigger(document, uiEvent, false, 'UIEvent');
}

module.exports = (id, uiEvent) => {
  let dom = document.getElementById(id);
  eventManager.bind(dom, 'click', event => onClick(event, uiEvent));
};
