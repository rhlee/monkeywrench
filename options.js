"use strict";

document.addEventListener(
  'DOMContentLoaded',
  () => {
    host.onclick = () => download(browser.runtime.getURL("monkey"), "monkey");
    path.oninput = event => {manifest.disabled = !event.target.value;}
    manifest.onclick = () => download(
      createURL(
        {
          name: "monkeywrench",
          description: "monkeywrench host",
          path: path.value,
          type: 'stdio',
          allowed_extensions: [browser.runtime.id]
        },
        'application/json'
      ),
      "monkeywrench.json"
    );
  }
);

const port = browser.runtime.connect({name: 'connection'});
port.onMessage.addListener(message => {result.innerHTML = message.result;});

const createURL = (data, type) =>
  URL.createObjectURL(new Blob([JSON.stringify(data)], {type: type}));

const download = (_URL, name) => {
    const anchor = document.createElement('a');
    anchor.href = _URL;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(_URL);
};
