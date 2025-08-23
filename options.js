"use strict";

const port = browser.runtime.connect({name: 'connection'});
port.onMessage.addListener(message => {
  console.log(message);
});
