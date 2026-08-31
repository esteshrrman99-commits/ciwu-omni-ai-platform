(() => {
  'use strict';

  const STATE = {
    endpoints: {
      m3: '/api/m3/health',
      cortex:
        '/api/workbench/cortex/intelligence/status',
      projectBrain:
        '/api/workbench/project-brain',
      neurotex:
        '/api/workbench/neurotex',
      approval:
        '/api/workbench/xeon/approval/status',
      sovereign:
        '/api/sovereign/health'
    }
  };

  async function json(url) {
    try {
      const response = await fetch(
        url,
        {cache:'no-store'}
      );

      return {
        http:response.status,
        ok:response.ok,
        data:
          await response.json()
      };
    } catch (error) {
      return {
        http:0,
        ok:false,
        error:error.message
      };
    }
  }

  async function status() {
    const entries=
      Object.entries(
        STATE.endpoints
      );

    const results=
      await Promise.all(
        entries.map(
          async ([name,url])=>[
            name,
            await json(url)
          ]
        )
      );

    return Object.fromEntries(
      results
    );
  }

  window.CIWUSovereignIntelligence=
    Object.freeze({
      status
    });
})();
