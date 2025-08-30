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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.sync.get(['enabled', 'level'], (data) => {
      if (data.enabled !== false) {
        chrome.scripting.executeScript({
          target: { tabId: tabId, allFrames: true },
          files: ['content.js']
        }).catch(() => {
          
        });
      }
    });
  }
});

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