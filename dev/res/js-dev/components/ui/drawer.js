/* jshint browser:true */

'use strict';

let toggle = require('./toggle');

const DRAWER_TOGGLE_ID = 'locationsToggle';
const DRAWER_ID = 'locations';
const ACTIVE_CLASS_NAME_SUFFIX = '-is-active';

module.exports = _ => {

  let locationsDrawer;
  let activeClass;

  function toggleDrawer() {
    locationsDrawer.classList.toggle(activeClass);
  }

  locationsDrawer = document.getElementById(DRAWER_ID);
  activeClass = `${DRAWER_ID}${ACTIVE_CLASS_NAME_SUFFIX}`;
  toggle(DRAWER_TOGGLE_ID, toggleDrawer);

};
