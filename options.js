"use strict";

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
test.onclick = async () => {
  let result = browser.runtime.sendMessage({type: 'test'});
  test.innerHTML = "Waiting ...";
  test.disabled = true;
  if (await result) test.innerHTML = "✅";
};

const createURL = (data, type) =>
  URL.createObjectURL(new Blob([JSON.stringify(data)], {type: type}));

const download = (_URL, name) => {
  const anchor = document.createElement('a');
  anchor.href = _URL;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(_URL);
};
