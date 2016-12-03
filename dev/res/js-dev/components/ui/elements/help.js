/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');

const HELP_ID = 'help';
const ACTIVE_CLASS_NAME_SUFFIX = '-is-active';

function onUIHelp(dom, activeClass) {
  dom.classList.toggle(activeClass);
}

module.exports = _ => {
  let dom = document.getElementById(HELP_ID);
  let activeClass = `${HELP_ID}${ACTIVE_CLASS_NAME_SUFFIX}`;
  eventManager.bind(document, uiEvents.help, _ => onUIHelp(dom, activeClass));
};
