(function() {
  'use strict';

  const WCAG_AA_NORMAL = 4.5;
  const WCAG_AA_LARGE = 3.0;
  const WCAG_AAA_NORMAL = 7.0;
  const WCAG_AAA_LARGE = 4.5;
  const LARGE_TEXT_PX = 18.5;
  const BOLD_LARGE_TEXT_PX = 14;

  let enabled = true;
  let level = 'AA';
  let forceMode = false;
  let forceBold = false;
  const originalStyles = new WeakMap();

  function srgbToLinear(val) {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  }

  function getRelativeLuminance(rgb) {
    const [r, g, b] = rgb.map(srgbToLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function getContrastRatio(rgb1, rgb2) {
    const lum1 = getRelativeLuminance(rgb1);
    const lum2 = getRelativeLuminance(rgb2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function parseColor(color) {
    if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    
    if (data[3] === 0) return null;
    
    if (data[3] < 255) {
      const alpha = data[3] / 255;
      const blendedR = Math.round(data[0] * alpha + 255 * (1 - alpha));
      const blendedG = Math.round(data[1] * alpha + 255 * (1 - alpha));
      const blendedB = Math.round(data[2] * alpha + 255 * (1 - alpha));
      return [blendedR, blendedG, blendedB];
    }
    
    return [data[0], data[1], data[2]];
  }

  function getEffectiveBackground(element) {
    let el = element;
    let bgColor = null;
    
    while (el && el !== document.documentElement) {
      const style = window.getComputedStyle(el);
      const bg = parseColor(style.backgroundColor);
      
      if (bg) {
        bgColor = bg;
        break;
      }
      
      el = el.parentElement;
    }
    
    return bgColor || [255, 255, 255];
  }

  function isLargeText(element) {
    const style = window.getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    const fontWeight = parseInt(style.fontWeight, 10);
    const isBold = fontWeight >= 700;
    
    return fontSize >= LARGE_TEXT_PX || (isBold && fontSize >= BOLD_LARGE_TEXT_PX);
  }

  function getTargetRatio(element, level) {
    const isLarge = isLargeText(element);
    if (level === 'AAA') {
      return isLarge ? WCAG_AAA_LARGE : WCAG_AAA_NORMAL;
    }
    return isLarge ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
  }

  function shouldProcessElement(element) {
    // Process any element that might contain text
    const style = window.getComputedStyle(element);
    if (style.visibility === 'hidden' || style.display === 'none') return false;
    if (parseFloat(style.opacity) === 0) return false;
    
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    
    const tagName = element.tagName.toLowerCase();
    if (['script', 'style', 'noscript', 'iframe', 'object', 'embed', 'video', 'audio', 'img', 'svg'].includes(tagName)) {
      return false;
    }
    
    // Process all text-containing elements
    return true;
  }

  function adjustElementContrast(element) {
    if (!shouldProcessElement(element)) return;
    
    const style = window.getComputedStyle(element);
    const fgColor = parseColor(style.color);
    if (!fgColor) return;
    
    const bgColor = getEffectiveBackground(element);
    const currentRatio = getContrastRatio(fgColor, bgColor);
    const targetRatio = getTargetRatio(element, level);
    
    // In force mode, always adjust; otherwise only if below target
    if (!forceMode && currentRatio >= targetRatio) return;
    
    if (!originalStyles.has(element)) {
      originalStyles.set(element, {
        color: element.style.color || '',
        backgroundColor: element.style.backgroundColor || '',
        textShadow: element.style.textShadow || '',
        borderColor: element.style.borderColor || '',
        fontWeight: element.style.fontWeight || ''
      });
    }
    
    const bgLuminance = getRelativeLuminance(bgColor);
    
    if (forceMode) {
      // Force high contrast mode
      if (bgLuminance > 0.5) {
        // Light background - use black text
        element.style.setProperty('color', '#000000', 'important');
        element.style.setProperty('text-shadow', 'none', 'important');
      } else {
        // Dark background - use white text
        element.style.setProperty('color', '#ffffff', 'important');
        element.style.setProperty('text-shadow', 'none', 'important');
      }
    } else {
      // Smart adjustment based on contrast needs
      const useWhite = bgLuminance < 0.5;
      element.style.setProperty('color', useWhite ? '#ffffff' : '#000000', 'important');
      element.style.setProperty('text-shadow', 'none', 'important');
    }
    
    // Apply bold if force bold is enabled
    if (forceBold) {
      element.style.setProperty('font-weight', '700', 'important');
    }
    
    element.dataset.wcagAdjusted = 'true';
  }

  function restoreElement(element) {
    if (originalStyles.has(element)) {
      const original = originalStyles.get(element);
      element.style.color = original.color;
      element.style.backgroundColor = original.backgroundColor;
      element.style.textShadow = original.textShadow;
      element.style.borderColor = original.borderColor;
      element.style.fontWeight = original.fontWeight;
      delete element.dataset.wcagAdjusted;
      originalStyles.delete(element);
    }
  }

  function processPage() {
    if (!enabled) return;
    
    // Process ALL elements that might have text
    const elements = document.querySelectorAll('*');
    elements.forEach(adjustElementContrast);
    
    // Also process pseudo-elements by adding global CSS rules
    if (!document.getElementById('wcag-global-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'wcag-global-styles';
      styleEl.textContent = `
        body.wcag-force-contrast,
        body.wcag-force-contrast * {
          text-shadow: none !important;
        }
        body.wcag-force-contrast a,
        body.wcag-force-contrast button,
        body.wcag-force-contrast input,
        body.wcag-force-contrast select,
        body.wcag-force-contrast textarea {
          opacity: 1 !important;
        }
      `;
      document.head.appendChild(styleEl);
    }
    
    if (forceMode) {
      document.body.classList.add('wcag-force-contrast');
    } else {
      document.body.classList.remove('wcag-force-contrast');
    }
  }

  function restorePage() {
    const adjustedElements = document.querySelectorAll('[data-wcag-adjusted="true"]');
    adjustedElements.forEach(restoreElement);
    document.body.classList.remove('wcag-force-contrast');
  }

  function handleMutations(mutations) {
    if (!enabled) return;
    
    const elementsToProcess = new Set();
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            elementsToProcess.add(node);
            node.querySelectorAll('*').forEach(child => elementsToProcess.add(child));
          }
        });
      } else if (mutation.type === 'attributes') {
        elementsToProcess.add(mutation.target);
      }
    });
    
    elementsToProcess.forEach(adjustElementContrast);
  }

  // Message listener for popup communication
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStats') {
      const adjustedElements = document.querySelectorAll('[data-wcag-adjusted="true"]');
      const allElements = document.querySelectorAll('*');
      let textElementCount = 0;
      
      allElements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.visibility !== 'hidden' && style.display !== 'none') {
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
      enabled = true;
      processPage();
      sendResponse({ success: true });
      return true;
    }
    
    if (request.action === 'disable') {
      enabled = false;
      restorePage();
      sendResponse({ success: true });
      return true;
    }
    
    if (request.action === 'changeLevel') {
      level = request.level || 'AA';
      restorePage();
      processPage();
      sendResponse({ success: true });
      return true;
    }
    
    if (request.action === 'toggleForce') {
      forceMode = request.forceMode;
      restorePage();
      processPage();
      sendResponse({ success: true });
      return true;
    }
    
    if (request.action === 'toggleBold') {
      forceBold = request.forceBold;
      restorePage();
      processPage();
      sendResponse({ success: true });
      return true;
    }
  });

  // Initialize
  chrome.storage.sync.get(['enabled', 'level', 'forceMode', 'forceBold'], (data) => {
    enabled = data.enabled !== false;
    level = data.level || 'AA';
    forceMode = data.forceMode || false;
    forceBold = data.forceBold || false;
    
    if (enabled) {
      processPage();
    }
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.enabled) {
        enabled = changes.enabled.newValue;
        if (enabled) {
          processPage();
        } else {
          restorePage();
        }
      }
      if (changes.level) {
        level = changes.level.newValue;
        if (enabled) {
          restorePage();
          processPage();
        }
      }
      if (changes.forceMode) {
        forceMode = changes.forceMode.newValue;
        if (enabled) {
          restorePage();
          processPage();
        }
      }
      if (changes.forceBold) {
        forceBold = changes.forceBold.newValue;
        if (enabled) {
          restorePage();
          processPage();
        }
      }
    }
  });

  // Wait for DOM and process
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processPage);
  } else {
    // Process immediately
    processPage();
  }

  // Observe changes
  const observer = new MutationObserver(handleMutations);
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  } else {
    // Wait for body to exist
    const bodyObserver = new MutationObserver(() => {
      if (document.body) {
        bodyObserver.disconnect();
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
        processPage();
      }
    });
    bodyObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

})();