"use strict";

let connection = null;
let resolve;

browser.runtime.onMessage.addListener(async message => {
  switch (message.type) {
    case 'test':
      if (connection) return true;
      else {
        connect();
        return await send({type: 'ping'}) === 'pong' && await stop();
      }
      break;
  }
});

const connect = () => {
  connection = browser.runtime.connectNative('monkeywrench');
  connection.onMessage.addListener(message => {
    let reply = message.reply;
    if (reply) {
      resolve(reply);
      resolve = null;
    } else handleEvent(message);
  });
};

const send = message => {
  console.assert(!resolve);
  let promise = new Promise(_resolve => resolve = _resolve);
  connection.postMessage(message);
  return promise;
};

const stop = async () => await send({type: 'stop'}) === 'stopped';
