/* jshint browser:true */

'use strict';

module.exports = (id, task) => {

  let dom;

  function onClick(event) {
    event.preventDefault();
    task();
  }

  dom = document.getElementById(id);
  dom.addEventListener('click', onClick);

};
