"use strict"

document.addEventListener(
  'DOMContentLoaded',
  async () => {
    options.onclick = () => browser.runtime.openOptionsPage();
    watch.onclick = async event => {
      await browser.storage.local.set({path: path.value});
      console.assert(await browser.runtime.sendMessage({
        type: 'watch',
        path: path.value,
        tab:
          (await browser.tabs.query({active: true, currentWindow: true}))[0].id
      }));
      set(true);
    };
    _stop.onclick = async() => {
      console.assert(await browser.runtime.sendMessage({type: 'stop'}));
      set(false);
    };
    path.value = (await browser.storage.local.get('path')).path ?? "";
    set(await browser.runtime.sendMessage({type: 'watching'}));
  }
);

const set = watching => {
  let list = controls.classList;
  (watching ? list.add : list.remove).bind(list)('watching');
  path.disabled = watching;
};
