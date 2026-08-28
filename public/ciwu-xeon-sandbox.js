(() => {
  'use strict';

  async function load() {
    const host=
      document.getElementById(
        'ciwu-project-brain'
      );

    if (!host)
      return;

    if (
      document.getElementById(
        'ciwu-xeon-status'
      )
    ) return;

    const section=
      document.createElement(
        'section'
      );

    section.id=
      'ciwu-xeon-status';

    section.className=
      'ciwu-card ciwu-card-pad';

    section.style.marginTop='14px';

    const title=
      document.createElement('h3');

    title.textContent=
      'CODEX × XEON Sandbox';

    const body=
      document.createElement('pre');

    body.className='ciwu-diff';
    body.textContent=
      'Loading sandbox safety state…';

    section.append(
      title,
      body
    );

    host.appendChild(section);

    try {
      const response=
        await fetch(
          '/api/workbench/xeon/status',
          {
            cache:'no-store'
          }
        );

      const data=
        await response.json();

      body.textContent=
        JSON.stringify(
          data,
          null,
          2
        );

    } catch (error) {
      body.textContent=
        `XEON status unavailable: ${error.message}`;
    }
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      load
    );
  } else {
    load();
  }
})();
