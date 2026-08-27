(function () {
  'use strict';

  async function loadEONSStatus() {
    try {
      const response = await fetch('/api/eons/status');

      if (!response.ok) {
        throw new Error('EONS status unavailable');
      }

      const data = await response.json();

      const existing =
        document.getElementById('eons-cortex-status');

      if (existing) existing.remove();

      const badge = document.createElement('div');

      badge.id = 'eons-cortex-status';

      badge.style.cssText = [
        'position:fixed',
        'bottom:20px',
        'right:20px',
        'z-index:99999',
        'padding:12px 18px',
        'border-radius:14px',
        'background:#10151c',
        'border:1px solid #00ff88',
        'color:#00ff88',
        'font-family:monospace',
        'font-size:12px',
        'box-shadow:0 0 20px rgba(0,255,136,.18)'
      ].join(';');

      badge.innerHTML =
        'EONS CORTEX: ONLINE<br>' +
        'MODELS: ' +
        data.registered_models +
        '<br>' +
        'PROVIDERS: ' +
        data.registered_providers +
        '<br>' +
        'CAPABILITIES: ' +
        data.capabilities;

      document.body.appendChild(badge);

    } catch (error) {
      console.warn(
        '[EONS] Dashboard status unavailable:',
        error.message
      );
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      loadEONSStatus
    );
  } else {
    loadEONSStatus();
  }

  setInterval(loadEONSStatus, 10000);
})();
