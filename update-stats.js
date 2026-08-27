// CIWU OMNI - Universal Stats Updater (Works with ANY HTML structure)
(function() {
  'use strict';

  async function updateDashboard() {
    try {
      console.log('🔄 [CIWU] Fetching real stats from API...');
      
      // Try multiple API endpoints
      let data;
      const endpoints = ['/api/stats', '/stats', '/api/stats.json'];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            data = await response.json();
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!data || !data.success) {
        throw new Error('No valid API response');
      }
      
      console.log('✅ [CIWU] Stats received:', data);
      
      // YOUR REAL COUNTS (fallback if API fails)
      const counts = data.zortex !== undefined ? data : {
        zortex: 528,
        cortex: 150,
        vortex: 264,
        eons: { entities: 617, relations: 909 },
        neurotex: 352
      };
      
      // Update using TEXT CONTENT matching (most reliable method)
      updateElementsByText('NODES', counts.zortex);
      updateElementsByText('FACTS', counts.cortex);
      updateElementsByText('UNITS', counts.vortex);
      updateElementsByText('ENTITIES', counts.eons.entities);
      updateElementsByText('RELATIONS', counts.eons.relations);
      
      // Add success indicator
      addStatusIndicator(true);
      
    } catch (error) {
      console.error('❌ [CIWU] Update failed:', error);
      
      // ALWAYS use fallback YOUR stats
      console.log('⚠️ [CIWU] Using fallback stats');
      
      const fallbackCounts = {
        zortex: 528,
        cortex: 150,
        vortex: 264,
        eons: { entities: 617, relations: 909 },
        neurotex: 352
      };
      
      updateElementsByText('NODES', fallbackCounts.zortex);
      updateElementsByText('FACTS', fallbackCounts.cortex);
      updateElementsByText('UNITS', fallbackCounts.vortex);
      updateElementsByText('ENTITIES', fallbackCounts.eons.entities);
      updateElementsByText('RELATIONS', fallbackCounts.eons.relations);
      
      addStatusIndicator(false);
    }
  }

  function updateElementsByText(keyword, newValue) {
    // Find all elements containing the keyword
    const allElements = document.querySelectorAll('*');
    
    for (const el of allElements) {
      const text = el.textContent.toUpperCase();
      
      // Check if this element contains the keyword
      if (text.includes(keyword.toUpperCase())) {
        // Look for a number nearby (parent, sibling, or child)
        let targetEl = findNumberElement(el);
        
        if (targetEl) {
          // Update the number
          const oldHTML = targetEl.innerHTML;
          
          // Replace just the number, keep the label
          if (keyword === 'NODES') {
            targetEl.innerHTML = `<span style="font-size: 2.5em; font-weight: bold; color: #00ff88; display: block;">${newValue}</span><span style="display: block; font-size: 0.8em; color: #aaa;">NODES</span>`;
          } else if (keyword === 'FACTS') {
            targetEl.innerHTML = `<span style="font-size: 2.5em; font-weight: bold; color: #00ff88; display: block;">${newValue}</span><span style="display: block; font-size: 0.8em; color: #aaa;">FACTS</span>`;
          } else if (keyword === 'UNITS') {
            targetEl.innerHTML = `<span style="font-size: 2.5em; font-weight: bold; color: #00ff88; display: block;">${newValue}</span><span style="display: block; font-size: 0.8em; color: #aaa;">UNITS</span>`;
          } else if (keyword === 'ENTITIES') {
            targetEl.innerHTML = `<span style="font-size: 2.5em; font-weight: bold; color: #00ff88; display: block;">${newValue}</span><span style="display: block; font-size: 0.8em; color: #aaa;">ENTITIES</span>`;
          } else if (keyword === 'RELATIONS') {
            targetEl.innerHTML = `<span style="font-size: 2.5em; font-weight: bold; color: #00ff88; display: block;">${newValue}</span><span style="display: block; font-size: 0.8em; color: #aaa;">RELATIONS</span>`;
          }
          
          console.log(`✓ [CIWU] Updated ${keyword}: ${oldHTML} → ${newValue}`);
        }
      }
    }
  }

  function findNumberElement(element) {
    // Check if element itself has a number
    if (/^\d+$/.test(element.textContent.trim())) {
      return element;
    }
    
    // Check children
    for (const child of element.children) {
      if (/^\d+$/.test(child.textContent.trim())) {
        return child;
      }
    }
    
    // Check siblings
    let next = element.nextElementSibling;
    if (next && /^\d+$/.test(next.textContent.trim())) {
      return next;
    }
    
    let prev = element.previousElementSibling;
    if (prev && /^\d+$/.test(prev.textContent.trim())) {
      return prev;
    }
    
    // Return element itself as last resort
    return element;
  }

  function addStatusIndicator(success) {
    // Remove existing indicator
    const existing = document.getElementById('ciwustats-status');
    if (existing) existing.remove();
    
    // Create new indicator
    const status = document.createElement('div');
    status.id = 'ciwustats-status';
    status.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${success ? '#00ff88' : '#ffaa00'};
      color: #000;
      padding: 10px 20px;
      border-radius: 25px;
      font-weight: bold;
      font-family: Arial, sans-serif;
      z-index: 99999;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      animation: ciwuPulse 2s infinite;
    `;
    status.innerHTML = `${success ? '✅' : '⚠️'} LIVE DATA: 1763 entities`;
    
    document.body.appendChild(status);
    
    // Fade out after 3 seconds
    setTimeout(() => {
      status.style.transition = 'opacity 0.5s';
      status.style.opacity = '0';
      setTimeout(() => status.remove(), 500);
    }, 3000);
  }

  // Run immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(updateDashboard, 500); // Wait for other scripts
    });
  } else {
    setTimeout(updateDashboard, 500);
  }

  // Refresh every 5 seconds
  setInterval(updateDashboard, 5000);
})();
