document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const levelSelect = document.getElementById('levelSelect');
  const forceToggle = document.getElementById('forceToggle');
  const boldToggle = document.getElementById('boldToggle');
  const refreshBtn = document.getElementById('refreshBtn');

  chrome.storage.sync.get(['enabled', 'level', 'forceMode', 'forceBold'], (data) => {
    enableToggle.checked = data.enabled !== false;
    levelSelect.value = data.level || 'AA';
    forceToggle.checked = data.forceMode || false;
    boldToggle.checked = data.forceBold || false;
  });

  enableToggle.addEventListener('change', async () => {
    const enabled = enableToggle.checked;
    await chrome.storage.sync.set({ enabled });
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { 
        action: enabled ? 'enable' : 'disable' 
      });
    }
  });

  levelSelect.addEventListener('change', async () => {
    const level = levelSelect.value;
    await chrome.storage.sync.set({ level });
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { 
        action: 'changeLevel',
        level: level 
      });
    }
  });

  forceToggle.addEventListener('change', async () => {
    const forceMode = forceToggle.checked;
    await chrome.storage.sync.set({ forceMode });
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { 
        action: 'toggleForce',
        forceMode: forceMode 
      });
    }
  });

  boldToggle.addEventListener('change', async () => {
    const forceBold = boldToggle.checked;
    await chrome.storage.sync.set({ forceBold });
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { 
        action: 'toggleBold',
        forceBold: forceBold 
      });
    }
  });

  refreshBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.reload(tab.id);
      window.close();
    }
  });
});