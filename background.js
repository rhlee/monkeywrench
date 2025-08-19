"use strict";

let tabActive = null;

browser.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]});
browser.browserAction.setBadgeText({text: "🔴"});

browser.browserAction.onClicked.addListener(tab => {
  if (tabActive) {
    browser.browserAction.setBadgeText({text: null, tabId: tabActive});
    browser.browserAction.setBadgeText({text: "🔴"});
    tabActive = null;
  } else {
    tabActive = tab.id;
    browser.browserAction.setBadgeText({text: "🟠"});
    browser.browserAction.setBadgeText({text: "🟢", tabId: tabActive});
  }
});
