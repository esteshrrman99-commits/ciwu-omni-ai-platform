(() => {
  'use strict';

  async function boot() {
    const host=
      document.getElementById(
        'ciwu-repair-search-status'
      ) ||
      document.getElementById(
        'ciwu-xeon-status'
      ) ||
      document.getElementById(
        'ciwu-project-brain'
      );

    if (
      !host ||
      document.getElementById(
        'ciwu-repair-approval-status'
      )
    ) {
      return;
    }

    const section=
      document.createElement(
        'section'
      );

    section.id=
      'ciwu-repair-approval-status';

    section.className=
      'ciwu-card ciwu-card-pad';

    section.style.marginTop='14px';

    const title=
      document.createElement('h3');

    title.textContent=
      'Repair Proposal Approval Gate';

    const note=
      document.createElement('p');

    note.textContent=
      'Verified sandbox repairs may produce review proposals. Live approval-token issuance and production application remain disabled.';

    const output=
      document.createElement('pre');

    output.className='ciwu-diff';
    output.textContent=
      'Loading approval control plane…';

    section.append(
      title,
      note,
      output
    );

    host.appendChild(section);

    try {
      const response=
        await fetch(
          '/api/workbench/xeon/approval/status',
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
        `Approval status unavailable: ${error.message}`;
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
