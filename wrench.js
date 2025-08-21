"use strict";

const wrap = _function => {
  const errorStack = new Error();
  return (..._arguments) => _function.apply(null, _arguments)
    .catch(error => {
      errorStack.message = error.toString().replace(/^Error: /, "");
      console.log(errorStack);
    });
}

let tabActive = null;

browser.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]});
browser.browserAction.setBadgeText({text: "🔴"});

browser.browserAction.onClicked.addListener(wrap(async tab => {
  if (tabActive) {
    browser.browserAction.setBadgeText({text: null, tabId: tabActive});
    browser.browserAction.setBadgeText({text: "🔴"});
    tabActive = null;
  } else await browser.tabs.executeScript({
    code: `browser.runtime.sendMessage({
      tab: ${tab.id},
      path:
        prompt(${JSON.stringify(await browser.storage.local.get('path').path)})
    });`
  });
}));

browser.runtime.onMessage.addListener(wrap(async (message, sender) => {
  switch (message) {
    case null: break;
    case "":
      await browser.storage.local.clear();
      break;
    default:
      tabActive = message.tab;
      browser.browserAction.setBadgeText({text: "🟠"});
      browser.browserAction.setBadgeText({text: "🟢", tabId: tabActive});
  }
}));
