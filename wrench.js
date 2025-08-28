"use strict";

class ConnectionNative {
  static connection = null;
  static lastInformation = "disconnected from native host";

  static inform(message) {
    this.lastInformation = message;
    browser.runtime.sendMessage({type: 'information', information: message});
  }

  static update() {
    this.inform(this.lastInformation);
  }

  constructor(application) {
    this.application = application;
  }

  connect() {
    let constructor = this.constructor;
    constructor.inform("connecting to native host");
    constructor.connection
      = constructor.connectNative('monkeywrench');
    constructor.connection.onDisconnect.addListener(() => {
      constructor.inform("disconnected from native host");
      constructor.connection = null;
      constructor.lastInformation = null;
    });
  }
}

browser.runtime.onMessage.addListener(message => {
  switch (message.type) {
    case 'update':
      ConnectionNative.update();
      break;
  }
});
