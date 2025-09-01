"use strict";

let connection = null;
let lastInformation = "disconnected from native host";

const connect = test => {
  inform("connecting to native host");
  connection = browser.runtime.connectNative('monkeywrench');
  connection.onMessage.addListener(async message => {
    await browser.runtime.sendMessage({type: 'receive', message: message});
    switch (message.type) {
      case 'pong':
        if (test) disconnect();
        break;
    }
  });
  connection.onDisconnect.addListener(() => {
    connection = null;
    inform("disconnected from native host");
  });
  send({type: 'ping'});
}

const disconnect = () => {
  connection.disconnect();
  connection = null;
  inform("disconnected from native host");
};

const inform = message => {
  browser.runtime.sendMessage({type: 'information', information: message});
  lastInformation = message;
};

const update = () => {
  inform(lastInformation);
  browser.runtime.sendMessage({type: 'status', status: 'stopped'});
};

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
      connect(true);
      break;
    case 'action':
      if (!connection) connect();
      send(message);
      break;
  }
});
