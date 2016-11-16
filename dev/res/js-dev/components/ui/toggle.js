/* jshint browser:true */

'use strict';

const ACTIVE_CLASS_NAME_SUFFIX = '-is-active';

module.exports = (id, task) => {

  let dom;
  let activeClass;

  function onClick(event) {
    event.preventDefault();
    dom.classList.toggle(activeClass);
    task();
  }

  dom = document.getElementById(id);
  activeClass = `${id}${ACTIVE_CLASS_NAME_SUFFIX}`;
  dom.addEventListener('click', onClick);

};
