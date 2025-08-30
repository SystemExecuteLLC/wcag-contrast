document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const levelSelect = document.getElementById('levelSelect');
  const forceToggle = document.getElementById('forceToggle');
  const boldToggle = document.getElementById('boldToggle');
  const fixedCount = document.getElementById('fixedCount');
  const totalCount = document.getElementById('totalCount');
  const refreshBtn = document.getElementById('refreshBtn');

  chrome.storage.sync.get(['enabled', 'level', 'forceMode', 'forceBold'], (data) => {
    enableToggle.checked = data.enabled !== false;
    levelSelect.value = data.level || 'AA';
    forceToggle.checked = data.forceMode || false;
    boldToggle.checked = data.forceBold || false;
  });

  async function updateStats() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.id) {
        fixedCount.textContent = '0';
        totalCount.textContent = '0';
        return;
      }

      chrome.tabs.sendMessage(tab.id, { action: 'getStats' }, (response) => {
        if (chrome.runtime.lastError) {
          fixedCount.textContent = '0';
          totalCount.textContent = '0';
          return;
        }
        
        if (response && response.fixed !== undefined && response.total !== undefined) {
          fixedCount.textContent = response.fixed;
          totalCount.textContent = response.total;
        }
      });
    } catch (error) {
      console.error('Error updating stats:', error);
      fixedCount.textContent = '0';
      totalCount.textContent = '0';
    }
  }

  enableToggle.addEventListener('change', async () => {
    const enabled = enableToggle.checked;
    await chrome.storage.sync.set({ enabled });
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { 
        action: enabled ? 'enable' : 'disable' 
      }, () => {
        if (!chrome.runtime.lastError) {
          setTimeout(updateStats, 100);
        }
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
      }, () => {
        if (!chrome.runtime.lastError) {
          setTimeout(updateStats, 100);
        }
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
      }, () => {
        if (!chrome.runtime.lastError) {
          setTimeout(updateStats, 100);
        }
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
      }, () => {
        if (!chrome.runtime.lastError) {
          setTimeout(updateStats, 100);
        }
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

  updateStats();
  setInterval(updateStats, 1000);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    const adjustedElements = document.querySelectorAll('[data-wcag-adjusted="true"]');
    const allTextElements = document.querySelectorAll('body, body *');
    let textElementCount = 0;
    
    allTextElements.forEach(el => {
      if (el.textContent && el.textContent.trim() && 
          window.getComputedStyle(el).visibility !== 'hidden' &&
          window.getComputedStyle(el).display !== 'none') {
        textElementCount++;
      }
    });
    
    sendResponse({
      fixed: adjustedElements.length,
      total: textElementCount
    });
    return true;
  }
  
  if (request.action === 'enable') {
    if (typeof processPage === 'function') {
      processPage();
    }
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'disable') {
    if (typeof restorePage === 'function') {
      restorePage();
    }
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'changeLevel') {
    if (typeof restorePage === 'function' && typeof processPage === 'function') {
      restorePage();
      processPage();
    }
    sendResponse({ success: true });
    return true;
  }
});