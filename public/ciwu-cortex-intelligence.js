(() => {
  'use strict';

  async function request(url) {
    const response=await fetch(
      url,
      {cache:'no-store'}
    );

    return response.json();
  }

  async function boot() {
    const host=
      document.getElementById(
        'ciwu-repair-approval-status'
      ) ||
      document.getElementById(
        'ciwu-repair-search-status'
      ) ||
      document.getElementById(
        'ciwu-project-brain'
      );

    if (
      !host ||
      document.getElementById(
        'ciwu-cortex-intelligence'
      )
    ) {
      return;
    }

    const section=
      document.createElement('section');

    section.id=
      'ciwu-cortex-intelligence';

    section.className=
      'ciwu-card ciwu-card-pad';

    section.style.marginTop='14px';

    section.innerHTML=`
      <h3>CORTEX Engineering Intelligence</h3>
      <p>
        Bounded autonomous software-engineering loop:
        understand → ground → plan → generate → validate →
        critique → repair → reverify → judge → handoff.
      </p>
      <pre class="ciwu-diff">Loading intelligence state…</pre>
    `;

    host.appendChild(section);

    const output=
      section.querySelector('pre');

    try {
      const [
        status,
        gaps,
        evalPolicy
      ]=await Promise.all([
        request(
          '/api/workbench/cortex/intelligence/status'
        ),
        request(
          '/api/workbench/cortex/capability-gaps'
        ),
        request(
          '/api/workbench/cortex/evals/policy'
        )
      ]);

      output.textContent=
        JSON.stringify(
          {
            status,
            highestPriorityGaps:
              gaps.gaps?.slice(0,5) || [],
            evalPolicy
          },
          null,
          2
        );
    } catch (error) {
      output.textContent=
        `CORTEX status unavailable: ${error.message}`;
    }
  }

  if (document.readyState==='loading') {
    document.addEventListener(
      'DOMContentLoaded',
      boot
    );
  } else {
    boot();
  }
})();
