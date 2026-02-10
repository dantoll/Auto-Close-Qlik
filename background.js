chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "closeThisTab" && sender.tab?.id) {
    chrome.tabs.remove(sender.tab.id);
  }
});
