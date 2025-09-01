"use strict"

document.addEventListener(
  'DOMContentLoaded',
  async () => {
    options.onclick = () => browser.runtime.openOptionsPage();
    watch.onclick = async () => {
      await browser.storage.local.set({path: path.value});
      browser.runtime.sendMessage
        ({type: 'action', action: 'watch', path: path.value});
    };
    browser.runtime.onMessage.addListener(message => {
      switch (message.type) {
        case 'status':
          controls.class = message.status;
          path.disabled = message.status === 'watching';
          break;
      }
    });
    path.value = (await browser.storage.local.get('path')).path ?? "";
    browser.runtime.sendMessage({type: 'update'});
  }
);

