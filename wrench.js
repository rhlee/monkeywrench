"use strict";

let connection = null;
let lastInformation = "disconnected from native host";

const connect = () => {
  inform("connecting to native host");
  connection = browser.runtime.connectNative('monkeywrench');
  connection.onMessage.addListener(async message => {
    await browser.runtime.sendMessage({type: 'receive', message: message});
    switch (message.type) {
      case 'pong':
        connection.disconnect();
        connection = null;
        inform("disconnected from native host");
        break;
    }
  });
  connection.onDisconnect.addListener(() => {
    connection = null;
    inform("disconnected from native host");
  });
  send({type: 'ping'});
}

const inform = message => {
  browser.runtime.sendMessage({type: 'information', information: message});
  lastInformation = message;
}

const update = () => inform(lastInformation);

const send = async message => {
  await browser.runtime.sendMessage({type: 'send', message: message});
  connection.postMessage(message);
};

browser.runtime.onMessage.addListener(message => {
  switch (message.type) {
    case 'update':
      update();
      break;
    case 'test':
      connect();
      break;
  }
});
