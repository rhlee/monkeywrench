"use strict";

let host = null;
let pong = false;

browser.runtime.onConnect.addListener(connection => {
  if (!host) {
    host = browser.runtime.connectNative('monkeywrench');
    host.onDisconnect.addListener(() => {
      connection.postMessage({type: pong ? 'pong' : 'failure'});
      host = null;
      pong = false;
    });
    host.onMessage.addListener(message => {
      switch (message.type) {
        case 'pong':
          pong = true;
          break;
      }
    });
    host.postMessage({type: 'ping'});
  }
});
