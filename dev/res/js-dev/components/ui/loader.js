/* jshint browser:true */

'use strict';

const LOADER_ID = 'loader';
const LOADER_HIDDEN_CLASS = `${LOADER_ID}-is-hidden`;

function removeLoader() {
  document.getElementById(LOADER_ID).classList.add(LOADER_HIDDEN_CLASS);
}

function showLoader() {
  document.getElementById(LOADER_ID).classList.remove(LOADER_HIDDEN_CLASS);
}

exports.show = showLoader();
exports.remove = removeLoader();
