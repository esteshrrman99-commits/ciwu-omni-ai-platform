(() => {
  'use strict';

  const state = {
    version: '3.5.0',

    sessionId:
      localStorage.getItem(
        'ciwu-abijah-session'
      ) ||
      (
        'abijah-' +
        Date.now() +
        '-' +
        Math.random()
          .toString(36)
          .slice(2)
      ),

    speaking: false,
    listening: false,

    lastResponse: '',

    recognition: null
  };

  localStorage.setItem(
    'ciwu-abijah-session',
    state.sessionId
  );

  const $ =
    id =>
      document.getElementById(id);

  function toast(
    message,
    good = true
  ) {
    const existing =
      $('m2-toast');

    if (existing) {
      existing.textContent =
        message;

      existing.style.borderColor =
        good
          ? 'rgba(32,227,154,.45)'
          : 'rgba(255,100,124,.55)';

      existing.classList.add(
        'show'
      );

      clearTimeout(
        existing._abijahTimer
      );

      existing._abijahTimer =
        setTimeout(
          () =>
            existing.classList
              .remove('show'),
          3000
        );

      return;
    }

    console.log(
      '[ABIJAH]',
      message
    );
  }

  function chooseVoice() {
    const voices =
      window.speechSynthesis
        ?.getVoices?.() || [];

    if (!voices.length) {
      return null;
    }

    const preferred =
      voices.find(v =>
        /natural|neural/i.test(
          v.name
        ) &&
        /^en/i.test(v.lang)
      ) ||

      voices.find(v =>
        /samantha|zira|female/i.test(
          v.name
        ) &&
        /^en/i.test(v.lang)
      ) ||

      voices.find(v =>
        /^en-US/i.test(v.lang)
      ) ||

      voices.find(v =>
        /^en/i.test(v.lang)
      );

    return preferred || null;
  }

  function stopSpeaking() {
    if (
      'speechSynthesis' in window
    ) {
      window.speechSynthesis
        .cancel();
    }

    state.speaking = false;

    updateVoiceStatus();
  }

  function speak(text) {
    const value =
      String(text || '')
        .replace(
          /https?:\/\/\S+/g,
          ''
        )
        .trim();

    if (!value) {
      return;
    }

    if (
      !(
        'speechSynthesis'
        in window
      )
    ) {
      toast(
        'Read-aloud is not supported by this browser.',
        false
      );

      return;
    }

    stopSpeaking();

    const utterance =
      new SpeechSynthesisUtterance(
        value
      );

    const voice =
      chooseVoice();

    if (voice) {
      utterance.voice =
        voice;
    }

    utterance.rate = 0.93;
    utterance.pitch = 1.02;
    utterance.volume = 1;

    utterance.onstart =
      () => {
        state.speaking = true;
        updateVoiceStatus();
      };

    utterance.onend =
      () => {
        state.speaking = false;
        updateVoiceStatus();
      };

    utterance.onerror =
      () => {
        state.speaking = false;
        updateVoiceStatus();
      };

    window.speechSynthesis
      .speak(utterance);
  }

  function replay() {
    if (state.lastResponse) {
      speak(
        state.lastResponse
      );
    }
  }

  function updateVoiceStatus() {
    const status =
      $('abijah-v35-voice-status');

    if (!status) {
      return;
    }

    if (state.listening) {
      status.textContent =
        '🎤 Listening…';
    } else if (state.speaking) {
      status.textContent =
        '🔊 Abijah speaking…';
    } else {
      status.textContent =
        'Voice ready';
    }
  }

  function getRecognition() {
    if (state.recognition) {
      return state.recognition;
    }

    const Recognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!Recognition) {
      return null;
    }

    const recognition =
      new Recognition();

    recognition.continuous =
      false;

    recognition.interimResults =
      true;

    recognition.lang =
      'en-US';

    recognition.onstart =
      () => {
        state.listening =
          true;

        updateVoiceStatus();

        toast(
          'Listening…'
        );
      };

    recognition.onend =
      () => {
        state.listening =
          false;

        updateVoiceStatus();
      };

    recognition.onerror =
      event => {
        state.listening =
          false;

        updateVoiceStatus();

        toast(
          'Microphone: ' +
          event.error,
          false
        );
      };

    recognition.onresult =
      event => {
        let transcript = '';

        for (
          let i =
            event.resultIndex;
          i <
            event.results.length;
          i++
        ) {
          transcript +=
            event.results[i][0]
              .transcript;
        }

        const input =
          $('chatInput');

        if (input) {
          input.value =
            transcript.trim();
        }

        const popupInput =
          $('abijah-input');

        if (popupInput) {
          popupInput.value =
            transcript.trim();
        }
      };

    state.recognition =
      recognition;

    return recognition;
  }

  function listen() {
    const recognition =
      getRecognition();

    if (!recognition) {
      toast(
        'Speech recognition is not available in this browser. You can still type and use read-aloud.',
        false
      );

      return;
    }

    stopSpeaking();

    try {
      recognition.start();
    } catch (_) {
      // already listening
    }
  }

  async function request(
    message
  ) {
    const response =
      await fetch(
        '/api/abijah',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            'X-Abijah-Session':
              state.sessionId
          },

          body:
            JSON.stringify({
              message,

              sessionId:
                state.sessionId
            })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        data.response ||
        `HTTP ${response.status}`
      );
    }

    return data;
  }

  function setMainResponse(
    text
  ) {
    const out =
      $('chatOut');

    if (!out) {
      return;
    }

    out.textContent =
      text;

    out.style.whiteSpace =
      'pre-wrap';

    out.style.lineHeight =
      '1.55';
  }

  async function askMain() {
    const input =
      $('chatInput');

    const message =
      input?.value
        ?.trim() || '';

    if (!message) {
      toast(
        'Tell Abijah what you want to talk about.',
        false
      );

      return;
    }

    setMainResponse(
      'Abijah is thinking…'
    );

    stopSpeaking();

    try {
      const data =
        await request(message);

      const reply =
        data.response ||
        'I am listening.';

      state.lastResponse =
        reply;

      setMainResponse(
        reply
      );

      if (input) {
        input.value = '';
      }

      speak(reply);

      toast(
        'Abijah replied'
      );

    } catch (error) {
      setMainResponse(
        'I could not complete that request: ' +
        error.message
      );

      toast(
        error.message,
        false
      );
    }
  }

  async function askPopup() {
    const input =
      $('abijah-input');

    const message =
      input?.value
        ?.trim() || '';

    if (!message) {
      toast(
        'Tell Abijah what is on your mind.',
        false
      );

      return;
    }

    if (
      typeof window.addMessage
        === 'function'
    ) {
      window.addMessage(
        message,
        true
      );
    }

    input.value = '';

    stopSpeaking();

    try {
      const data =
        await request(message);

      const reply =
        data.response ||
        'I am listening.';

      state.lastResponse =
        reply;

      if (
        typeof window.addMessage
          === 'function'
      ) {
        window.addMessage(
          reply,
          false
        );
      }

      speak(reply);

    } catch (error) {
      if (
        typeof window.addMessage
          === 'function'
      ) {
        window.addMessage(
          'I could not complete that request: ' +
          error.message,
          false
        );
      }
    }
  }

  async function resetConversation() {
    try {
      await fetch(
        '/api/abijah/reset',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify({
              sessionId:
                state.sessionId
            })
        }
      );

      state.lastResponse = '';

      toast(
        'Conversation memory cleared'
      );

    } catch (_) {
      toast(
        'Could not reset conversation.',
        false
      );
    }
  }

  function installMainVoiceControls() {
    const row =
      document.querySelector(
        '.chat-input-row'
      );

    if (!row) {
      return;
    }

    if (
      $('abijah-v35-controls')
    ) {
      return;
    }

    const controls =
      document.createElement(
        'div'
      );

    controls.id =
      'abijah-v35-controls';

    controls.innerHTML = `
      <div
        id="abijah-v35-voice-status"
        class="abijah-v35-status"
      >
        Voice ready
      </div>

      <div class="abijah-v35-buttons">
        <button
          type="button"
          id="abijah-v35-talk"
        >
          🎤 TALK
        </button>

        <button
          type="button"
          id="abijah-v35-replay"
        >
          🔊 REPLAY
        </button>

        <button
          type="button"
          id="abijah-v35-stop"
        >
          ■ STOP
        </button>

        <button
          type="button"
          id="abijah-v35-reset"
        >
          ↻ NEW CHAT
        </button>
      </div>
    `;

    row.insertAdjacentElement(
      'afterend',
      controls
    );

    $('abijah-v35-talk')
      ?.addEventListener(
        'click',
        listen
      );

    $('abijah-v35-replay')
      ?.addEventListener(
        'click',
        replay
      );

    $('abijah-v35-stop')
      ?.addEventListener(
        'click',
        stopSpeaking
      );

    $('abijah-v35-reset')
      ?.addEventListener(
        'click',
        resetConversation
      );
  }

  /*
   * Capture the existing SEND WITH ABIJAH control
   * before any legacy chat handler fires.
   */
  document.addEventListener(
    'click',
    event => {
      const button =
        event.target.closest(
          'button'
        );

      if (!button) {
        return;
      }

      const label =
        button.textContent
          .replace(/\s+/g, ' ')
          .trim()
          .toUpperCase();

      if (
        label.includes(
          'SEND WITH ABIJAH'
        )
      ) {
        event.preventDefault();

        event.stopImmediatePropagation();

        askMain();
      }
    },

    true
  );

  document.addEventListener(
    'keydown',
    event => {
      const input =
        event.target;

      if (
        input?.id ===
          'chatInput' &&
        event.key ===
          'Enter'
      ) {
        event.preventDefault();

        askMain();
      }
    },

    true
  );

  /*
   * Override popup Abijah sender after legacy
   * functions have loaded.
   */
  window.sendAbijah =
    askPopup;

  window.speakAbijah =
    speak;

  window.speakLastAbijah =
    replay;

  window.CIWU_ABIJAH_V35 = {
    version:
      state.version,

    ask:
      request,

    askMain,

    askPopup,

    listen,

    speak,

    stopSpeaking,

    replay,

    resetConversation,

    sessionId:
      state.sessionId
  };

  function boot() {
    installMainVoiceControls();

    if (
      'speechSynthesis'
      in window
    ) {
      window.speechSynthesis
        .getVoices();

      window.speechSynthesis
        .onvoiceschanged =
        () =>
          chooseVoice();
    }

    updateVoiceStatus();

    console.log(
      'ABIJAH 3.5 conversational voice motor active'
    );
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      boot
    );
  } else {
    boot();
  }
})();
