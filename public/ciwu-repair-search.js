(() => {
  'use strict';

  async function boot() {
    const host=
      document.getElementById(
        'ciwu-xeon-status'
      ) ||
      document.getElementById(
        'ciwu-project-brain'
      );

    if (
      !host ||
      document.getElementById(
        'ciwu-repair-search-status'
      )
    ) {
      return;
    }

    const section=
      document.createElement(
        'section'
      );

    section.id=
      'ciwu-repair-search-status';

    section.className=
      'ciwu-card ciwu-card-pad';

    section.style.marginTop='14px';

    const title=
      document.createElement('h3');

    title.textContent=
      'Autonomous Sandbox Repair Search';

    const note=
      document.createElement('p');

    note.textContent=
      'Candidates may be searched and tested only in isolated local XEON workspaces. Production application requires separate human authorization.';

    const output=
      document.createElement('pre');

    output.className='ciwu-diff';
    output.textContent=
      'Loading repair-search policy…';

    section.append(
      title,
      note,
      output
    );

    host.appendChild(section);

    try {
      const response=
        await fetch(
          '/api/workbench/xeon/repair-search/status',
          {
            cache:'no-store'
          }
        );

      const data=
        await response.json();

      output.textContent=
        JSON.stringify(
          data,
          null,
          2
        );

    } catch (error) {
      output.textContent=
        `Repair-search status unavailable: ${error.message}`;
    }
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
