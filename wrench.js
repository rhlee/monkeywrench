"use strict";

let connection = null;
let resolve;

browser.runtime.onMessage.addListener(async message => {
  switch (message.type) {
    case 'watching':
      return connection !== null;
      break;
    case 'test':
      if (connection) return true;
      else {
        connect();
        return await send(message) && await stop();
      }
      break;
    case 'watch':
      console.assert(connection === null);
      connect();
      return await send(message);
      break;
    case 'stop':
      let reply = await stop();
      return reply;
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
  connection.onDisconnect.addListener(() => connection = null);
};

const send = message => {
  console.assert(!resolve);
  let promise = new Promise(_resolve => resolve = _resolve);
  connection.postMessage(message);
  return promise;
};

const stop = async () => {
  let stopped = await send({type: 'stop'});
  connection = null;
  return stopped;
};
