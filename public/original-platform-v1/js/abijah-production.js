(() => {
  'use strict';

  async function request(message) {
    const response = await fetch(
      '/api/abijah',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          message
        })
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.response ||
        'Abijah request failed'
      );
    }

    return data;
  }

  async function sendFromPopup() {
    const input =
      document.getElementById(
        'abijah-input'
      );

    if (!input) return;

    const message =
      input.value.trim();

    if (!message) return;

    if (
      typeof window.addMessage ===
      'function'
    ) {
      window.addMessage(
        message,
        true
      );
    }

    input.value = '';

    try {
      const data =
        await request(message);

      if (
        typeof window.addMessage ===
        'function'
      ) {
        window.addMessage(
          data.response,
          false
        );
      }

      if (
        data.readAloud &&
        typeof window.speakAbijah ===
          'function'
      ) {
        /* User still controls speaker
           through existing Read Aloud UI. */
      }
    } catch (error) {
      if (
        typeof window.addMessage ===
        'function'
      ) {
        window.addMessage(
          'I had trouble connecting, darling. Please try again.',
          false
        );
      }

      console.error(
        'ABIJAH_UI_ERROR',
        error
      );
    }
  }

  /*
   * Override the old popup send function only.
   * Main CIWU chat remains on /api/chat.
   */
  window.sendAbijah =
    sendFromPopup;

  window.CIWU_ABIJAH = {
    version: '3.0.0',
    request,
    sendFromPopup
  };

  console.log(
    'CIWU Abijah production bridge active'
  );
})();
