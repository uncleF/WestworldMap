/* jshint browser:true */

'use strict';

const ERROR_ID = 'error';
const ERROR_MESSAGE_ID = 'errorMessage';
const ERROR_ACTIVE_CLASS_NAME = 'error-is-active';

exports.show = (error) => {
  document.getElementById(ERROR_MESSAGE_ID).textContent = error;
  document.getElementById(ERROR_ID).classList.toggle(ERROR_ACTIVE_CLASS_NAME);
};
