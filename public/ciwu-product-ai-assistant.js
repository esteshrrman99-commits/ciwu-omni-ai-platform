(() => {
  'use strict';

  function el(tag,attrs={},text='') {
    const node=
      document.createElement(tag);

    for (
      const [key,value]
      of Object.entries(attrs)
    ) {
      if (key==='class') {
        node.className=value;
      } else {
        node.setAttribute(
          key,
          value
        );
      }
    }

    if (text) {
      node.textContent=text;
    }

    return node;
  }

  function boot() {
    if (
      document.getElementById(
        'ciwu-fusion-launcher'
      )
    ) {
      return;
    }

    const style=
      el('style');

    style.textContent=`
      #ciwu-fusion-launcher{
        position:fixed;
        right:18px;
        bottom:18px;
        z-index:2147483000;
        border:0;
        border-radius:999px;
        padding:12px 16px;
        font:600 14px system-ui,sans-serif;
        cursor:pointer;
        box-shadow:0 8px 28px rgba(0,0,0,.28);
      }

      #ciwu-fusion-panel{
        position:fixed;
        right:18px;
        bottom:72px;
        z-index:2147483000;
        width:min(390px,calc(100vw - 36px));
        max-height:70vh;
        overflow:auto;
        background:#0a1018;
        color:#eef7f4;
        border:1px solid rgba(255,255,255,.12);
        border-radius:16px;
        padding:16px;
        box-shadow:0 18px 50px rgba(0,0,0,.45);
        display:none;
        font:14px system-ui,sans-serif;
      }

      #ciwu-fusion-panel button,
      #ciwu-fusion-panel textarea{
        font:inherit;
      }

      #ciwu-fusion-panel textarea{
        box-sizing:border-box;
        width:100%;
        min-height:86px;
        margin-top:10px;
        padding:10px;
      }

      #ciwu-fusion-panel pre{
        white-space:pre-wrap;
        overflow-wrap:anywhere;
      }

      #ciwu-fusion-panel a{
        color:#9dd7ff;
      }
    `;

    document.head.appendChild(
      style
    );

    const launcher=
      el(
        'button',
        {
          id:'ciwu-fusion-launcher',
          type:'button',
          'aria-expanded':'false'
        },
        'CIWU AI'
      );

    const panel=
      el(
        'aside',
        {
          id:'ciwu-fusion-panel',
          'aria-label':
            'CIWU Intelligence Assistant'
        }
      );

    const heading=
      el(
        'h3',
        {},
        'CIWU Intelligence'
      );

    const description=
      el(
        'p',
        {},
        'Your original product experience is connected to the sovereign intelligence fabric underneath.'
      );

    const status=
      el(
        'pre',
        {},
        'Checking intelligence status…'
      );

    const refresh=
      el(
        'button',
        {type:'button'},
        'Refresh status'
      );

    const admin=
      el(
        'a',
        {href:'/sovereign/'},
        'Open Sovereign Command Center'
      );

    panel.append(
      heading,
      description,
      refresh,
      status,
      admin
    );

    document.body.append(
      panel,
      launcher
    );

    async function update() {
      status.textContent=
        'Checking…';

      try {
        if (
          !window
            .CIWUSovereignIntelligence
        ) {
          throw new Error(
            'Intelligence bridge unavailable'
          );
        }

        const data=
          await window
            .CIWUSovereignIntelligence
            .status();

        status.textContent=
          JSON.stringify(
            data,
            null,
            2
          );
      } catch (error) {
        status.textContent=
          error.message;
      }
    }

    launcher.addEventListener(
      'click',
      () => {
        const opening=
          panel.style.display!==
            'block';

        panel.style.display=
          opening
            ? 'block'
            : 'none';

        launcher.setAttribute(
          'aria-expanded',
          String(opening)
        );

        if (opening) {
          update();
        }
      }
    );

    refresh.addEventListener(
      'click',
      update
    );
  }

  if (
    document.readyState===
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
