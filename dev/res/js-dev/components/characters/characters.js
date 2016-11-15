/* jshint browser:true */

'use strict';

const character = require('./character');

module.export = charactersDataURL => {

  let characterList;
  let dom;

  function createCharactersDOM() {
    return true;
  }

  function inittializeCharacterList(dataURL) {
    characterList = [];
    dom = createCharactersDOM();
    return Promise.resolve(dataURL);
  }

  function downloadCharactersData(dataURL) {

  }

  function updateCharacterList(rawCharactersData) {

  }

  function getCharacterList() {
    return characterList;
  }

  function getDOM() {
    return dom;
  }

  function initializeCharacters(dataURL) {
    inittializeCharacterList()
      .then(downloadCharactersData)
      .then(updateCharacterList);
  }

  initializeCharacters(charactersDataURL);

  return {
    init: initializeCharacters,
    list: getCharacterList,
    dom: getDOM
  };

};
