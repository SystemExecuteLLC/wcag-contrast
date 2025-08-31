chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabled: true,
    level: 'AA'
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getStats' }, (response) => {
          sendResponse(response || { fixed: 0, total: 0 });
        });
      } else {
        sendResponse({ fixed: 0, total: 0 });
      }
    });
    return true;
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.sync.get(['enabled'], (data) => {
    const newEnabled = !data.enabled;
    chrome.storage.sync.set({ enabled: newEnabled }, () => {
      chrome.tabs.sendMessage(tab.id, {
        action: newEnabled ? 'enable' : 'disable'
      });
    });
  });
});

// Content script is now automatically injected via manifest.json
// No need to manually inject it on tab updates

// Only add command listener if chrome.commands is available
if (chrome.commands && chrome.commands.onCommand) {
  chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle-contrast-fix') {
      chrome.storage.sync.get(['enabled'], (data) => {
        const newEnabled = !data.enabled;
        chrome.storage.sync.set({ enabled: newEnabled }, () => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: newEnabled ? 'enable' : 'disable'
              });
            }
          });
        });
      });
    }
  });
}