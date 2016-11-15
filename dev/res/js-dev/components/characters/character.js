/* jshint browser:true */

'use strict';

module.export = characterData => {

  let info;
  let dom;

  function createCharacterDOM() {
    return true;
  }

  function createCharacter(data) {
    info = data;
    dom = createCharacterDOM();
  }

  function removeCharacter() {
    info = null;
  }

  function getCharacter() {
    return info;
  }

  function getCharacterName() {
    return info.name;
  }

  function getCharacterPicture() {
    return info.picture;
  }

  function getCharacterHumanity() {
    return info.human;
  }

  function getDOM() {
    return dom;
  }

  createCharacter(characterData);

  return {
    create: createCharacter,
    remove: removeCharacter,
    info: getCharacter,
    name: getCharacterName,
    picture: getCharacterPicture,
    human: getCharacterHumanity,
    dom: getDOM
  };

};
