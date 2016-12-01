/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');

function onUIHelp() {
  console.log('Help');
}

module.exports = _ => {
  eventManager.bind(document, uiEvents.help, onUIHelp);
};
