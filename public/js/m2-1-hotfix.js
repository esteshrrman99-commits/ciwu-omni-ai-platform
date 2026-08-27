(() => {
  'use strict';

  const $ = id => document.getElementById(id);

  function notify(text, good = true) {
    if (
      window.CIWU_M2 &&
      document.getElementById('m2-toast')
    ) {
      const el = document.getElementById('m2-toast');

      el.textContent = text;
      el.style.borderColor = good
        ? 'rgba(32,227,154,.45)'
        : 'rgba(255,100,124,.55)';

      el.classList.add('show');

      clearTimeout(el._m21Timer);

      el._m21Timer = setTimeout(
        () => el.classList.remove('show'),
        3000
      );

      return;
    }

    console.log('[M2.1]', text);
  }

  async function jsonOrText(response) {
    const type =
      response.headers.get('content-type') || '';

    const value = type.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      throw new Error(
        typeof value === 'object'
          ? value.error ||
            value.message ||
            JSON.stringify(value)
          : value
      );
    }

    return value;
  }

  async function safeChat() {
    const input = $('chatInput');

    const message =
      input?.value?.trim() || '';

    const files =
      Array.isArray(window.uploadedFiles)
        ? window.uploadedFiles
        : [];

    if (!message && !files.length) {
      notify(
        'Enter a message or attach a file first.',
        false
      );
      return;
    }

    const out = $('chatOut');

    if (out) {
      out.textContent =
        'Abijah is processing your request...';
    }

    const fd = new FormData();

    fd.append('message', message);

    for (const file of files) {
      fd.append('images', file);
    }

    try {
      const response = await fetch(
        '/api/chat',
        {
          method: 'POST',
          body: fd
        }
      );

      const data = await jsonOrText(response);

      const answer =
        typeof data === 'object'
          ? data.response ||
            data.analysis ||
            data.message ||
            JSON.stringify(data, null, 2)
          : data;

      if (out) {
        out.textContent = answer;
      }

      if (input) {
        input.value = '';
      }

      notify('Abijah replied');
    } catch (error) {
      if (out) {
        out.textContent =
          'Request failed: ' + error.message;
      }

      notify(
        'Abijah request failed: ' +
        error.message,
        false
      );
    }
  }

  async function safeVideoAnalysis() {
    const input = $('videoInput');

    const file =
      window.uploadedVideo ||
      input?.files?.[0];

    if (!file) {
      notify(
        'Select a video before running video analysis.',
        false
      );
      return;
    }

    const out =
      $('videoAnalysisResult');

    if (out) {
      out.style.display = 'block';
      out.textContent =
        'Uploading video for analysis...';
    }

    const fd = new FormData();
    fd.append('video', file);

    try {
      const response = await fetch(
        '/api/analyze-video',
        {
          method: 'POST',
          body: fd
        }
      );

      const data = await jsonOrText(response);

      if (out) {
        out.textContent =
          typeof data === 'object'
            ? data.analysis ||
              JSON.stringify(data, null, 2)
            : data;
      }

      notify('Video analysis completed');
    } catch (error) {
      if (out) {
        out.textContent =
          'Video analysis failed: ' +
          error.message;
      }

      notify(
        'Video analysis failed',
        false
      );
    }
  }

  function findM3() {
    return (
      document.querySelector('#m3-console') ||
      document.querySelector('.m3-console') ||
      document.querySelector('#m3Console') ||
      document.querySelector('[data-m3-console]') ||
      document.querySelector('[id*="m3-console"]')
    );
  }

  function installM3Dock() {
    const panel = findM3();

    if (!panel) {
      setTimeout(installM3Dock, 500);
      return;
    }

    if (panel.dataset.m21Installed === '1') {
      return;
    }

    panel.dataset.m21Installed = '1';

    const toggle =
      document.createElement('button');

    toggle.id = 'm2-m3-toggle';
    toggle.type = 'button';

    const mobile =
      window.matchMedia(
        '(max-width: 720px)'
      ).matches;

    if (mobile) {
      panel.classList.add('m2-collapsed');
      toggle.textContent = 'OPEN';
    } else {
      toggle.textContent = 'MINIMIZE';
    }

    toggle.addEventListener(
      'click',
      event => {
        event.preventDefault();
        event.stopPropagation();

        const collapsed =
          panel.classList.toggle(
            'm2-collapsed'
          );

        toggle.textContent =
          collapsed
            ? 'OPEN'
            : 'MINIMIZE';
      }
    );

    panel.appendChild(toggle);

    relocateTelemetry(panel);
  }

  function relocateHealth() {
    const health =
      $('m2-health');

    const header =
      document.querySelector('.header');

    if (health && header) {
      header.appendChild(health);
    }
  }

  function relocateTelemetry(panel) {
    if (!panel) return;

    const all =
      Array.from(
        document.querySelectorAll('body *')
      );

    const candidates =
      all.filter(el => {
        if (el === panel) return false;

        const text =
          (el.textContent || '')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();

        return (
          text.includes('EONS CORTEX: ONLINE') &&
          text.includes('CAPABILITIES:')
        );
      });

    if (!candidates.length) return;

    /*
     * Pick the smallest matching element rather
     * than a giant parent wrapper.
     */
    candidates.sort(
      (a,b) =>
        a.textContent.length -
        b.textContent.length
    );

    const telemetry =
      candidates[0];

    telemetry.classList.add(
      'm2-telemetry'
    );

    panel.appendChild(telemetry);
  }

  /*
   * Capture-phase event repair:
   * stop legacy inline handlers BEFORE they fire.
   */
  document.addEventListener(
    'click',
    event => {
      const button =
        event.target.closest('button');

      if (!button) return;

      const label =
        (button.textContent || '')
          .replace(/\s+/g, ' ')
          .trim()
          .toUpperCase();

      if (
        label.includes('SEND WITH ABIJAH')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();

        safeChat();
        return;
      }

      if (
        label.includes('ANALYZE VIDEO')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();

        safeVideoAnalysis();
      }
    },
    true
  );

  function boot() {
    installM3Dock();

    setTimeout(
      relocateHealth,
      700
    );

    setTimeout(() => {
      const panel = findM3();
      if (panel) {
        relocateTelemetry(panel);
      }
    }, 1200);
  }

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      boot
    );
  } else {
    boot();
  }

  window.CIWU_M21 = {
    version: '2.1.0',
    safeChat,
    safeVideoAnalysis,
    installM3Dock
  };

  console.log(
    'CIWU OMNI M2.1 collision hotfix active'
  );
})();
