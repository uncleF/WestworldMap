/* jshint browser:true */

'use strict';

let eventManager = require('patterns/tx-event');
let uiEvents = require('ui/uiEvents');

module.exports = tasks => {

  /* UI Events */

  eventManager.bind(document, uiEvents.topDown, tasks.topDown);
  eventManager.bind(document, uiEvents.mapuirotate, tasks.mapuirotate);
  eventManager.bind(document, uiEvents.mapuiccwrotate, tasks.mapuiccwrotate);
  eventManager.bind(document, uiEvents.mapuicwrotate, tasks.mapuicwrotate);
  eventManager.bind(document, uiEvents.mapuipan, tasks.mapuipan);
  eventManager.bind(document, uiEvents.mapuipanleft, tasks.mapuipanleft);
  eventManager.bind(document, uiEvents.mapuipanright, tasks.mapuipanright);
  eventManager.bind(document, uiEvents.mapuizoom, tasks.mapuizoom);
  eventManager.bind(document, uiEvents.mapuizoomin, tasks.mapuizoomin);
  eventManager.bind(document, uiEvents.mapuizoomout, tasks.mapuizoomout);
  eventManager.bind(document, uiEvents.reset, tasks.reset);

  /* Window Events */

  eventManager.bind(window, 'resize', tasks.resize);

};
