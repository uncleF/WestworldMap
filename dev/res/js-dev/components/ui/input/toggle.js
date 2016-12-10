/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');

const ACTIVE_CLASS_NAME_SUFFIX = '-is-active';

function onClick(event, uiEvent, dom, activeClass) {
  event.preventDefault();
  event.stopPropagation();
  eventManager.trigger(document, uiEvent, false, 'UIEvent');
}

function onMapEvent(dom, activeClass) {
  dom.classList.toggle(activeClass);
}

module.exports = (id, uiEvent, mapEvent) => {
  let dom = document.getElementById(id);
  let activeClass = `${id}${ACTIVE_CLASS_NAME_SUFFIX}`;
  eventManager.bind(dom, 'click', event => onClick(event, uiEvent, dom, activeClass));
  eventManager.bind(dom, 'touchstart', event => onClick(event, uiEvent, dom, activeClass));
  eventManager.bind(document, mapEvent, event => onMapEvent(dom, activeClass));
};
