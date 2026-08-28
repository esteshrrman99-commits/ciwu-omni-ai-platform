(() => {
  'use strict';

  const API='/api/workbench';

  const state={
    graph:null,
    grounded:null,
    regression:null,
    patchPlan:null
  };

  function el(
    tag,
    text=null
  ) {
    const node=
      document.createElement(tag);

    if (text !== null)
      node.textContent=text;

    return node;
  }

  function setStatus(text) {
    const node=
      document.getElementById(
        'ciwu-project-brain-status'
      );

    if (node)
      node.textContent=text;
  }

  function render(value) {
    const node=
      document.getElementById(
        'ciwu-project-brain-output'
      );

    if (node) {
      node.textContent=
        JSON.stringify(
          value,
          null,
          2
        );
    }
  }

  async function json(
    path,
    options={}
  ) {
    const response=
      await fetch(
        `${API}${path}`,
        {
          cache:'no-store',
          ...options,
          headers:{
            Accept:'application/json',
            ...(options.headers || {})
          }
        }
      );

    let body=null;

    try {
      body=
        await response.json();
    } catch (_) {
      throw new Error(
        `INVALID_JSON_HTTP_${response.status}`
      );
    }

    if (
      !response.ok ||
      body?.ok === false
    ) {
      throw new Error(
        body?.error ||
        `HTTP_${response.status}`
      );
    }

    return body;
  }

  function currentSelectedFile() {
    const external=
      window.CIWU_PROJECT_INTELLIGENCE;

    const candidates=[
      external?.state?.selectedFile,
      external?.selectedFile,
      external?.state?.file
    ];

    return (
      candidates.find(
        value =>
          typeof value === 'string' &&
          value.length > 0
      ) ||
      'data/frontend/project-intelligence-v1.json'
    );
  }

  function shell() {
    if (
      document.getElementById(
        'ciwu-project-brain'
      )
    ) return;

    const preferred=
      document.getElementById(
        'ciwu-project-intelligence'
      );

    const fallback=
      document.querySelector(
        '[data-workbench-panel="repository"]'
      );

    const host=
      preferred ||
      fallback;

    if (!host)
      return;

    const section=el('section');
    section.id='ciwu-project-brain';
    section.className=
      'ciwu-card ciwu-card-pad';

    section.style.marginTop='14px';

    const eyebrow=el(
      'div',
      'PROJECT BRAIN'
    );

    eyebrow.className=
      'ciwu-eyebrow';

    const heading=el(
      'h3',
      'Grounded Code Reasoning'
    );

    const lead=el(
      'p',
      'Read-only graph grounding across source, symbols, dependencies, tests and certified releases.'
    );

    lead.className='ciwu-lead';

    const stats=el(
      'p',
      'Graph not loaded yet.'
    );

    stats.id=
      'ciwu-project-brain-stats';

    const objective=
      document.createElement(
        'textarea'
      );

    objective.id=
      'ciwu-project-brain-objective';

    objective.maxLength=2000;

    objective.placeholder=
      'Describe a candidate change to analyze. No production code will be modified.';

    const buttons=
      el('div');

    const graphButton=el(
      'button',
      'Load Project Brain'
    );

    graphButton.type='button';
    graphButton.id=
      'ciwu-project-brain-load';

    const groundButton=el(
      'button',
      'Ground Context'
    );

    groundButton.type='button';
    groundButton.id=
      'ciwu-project-brain-ground';

    const regressionButton=el(
      'button',
      'Regression Plan'
    );

    regressionButton.type='button';
    regressionButton.id=
      'ciwu-project-brain-regression';

    const patchButton=el(
      'button',
      'Candidate Patch Plan'
    );

    patchButton.type='button';
    patchButton.id=
      'ciwu-project-brain-patch';

    for (
      const button of [
        graphButton,
        groundButton,
        regressionButton,
        patchButton
      ]
    ) {
      button.className=
        'ciwu-button';

      buttons.appendChild(
        button
      );
    }

    const status=el(
      'p',
      'Project Brain initialized read-only.'
    );

    status.id=
      'ciwu-project-brain-status';

    const output=el(
      'pre',
      'No analysis yet.'
    );

    output.id=
      'ciwu-project-brain-output';

    output.className=
      'ciwu-diff';

    section.append(
      eyebrow,
      heading,
      lead,
      stats,
      objective,
      buttons,
      status,
      output
    );

    host.appendChild(section);
  }

  async function loadGraph() {
    try {
      setStatus(
        'Loading Project Brain…'
      );

      const graph=
        await json(
          '/project-brain'
        );

      state.graph=graph;

      const stats=
        document.getElementById(
          'ciwu-project-brain-stats'
        );

      if (stats) {
        stats.textContent=
          `${graph.nodeCount} node(s) • ${graph.edgeCount} edge(s)`;
      }

      render(graph);

      setStatus(
        'Project Brain graph loaded.'
      );
    } catch (error) {
      setStatus(
        `Project Brain blocked: ${error.message}`
      );
    }
  }

  async function ground() {
    try {
      const file=
        currentSelectedFile();

      const body=
        await json(
          '/grounded-context',
          {
            method:'POST',
            headers:{
              'Content-Type':
                'application/json'
            },
            body:JSON.stringify({
              files:[file],
              symbols:[]
            })
          }
        );

      state.grounded=body;
      render(body);

      setStatus(
        `Grounded context assembled for ${file}.`
      );
    } catch (error) {
      setStatus(
        `Grounding blocked: ${error.message}`
      );
    }
  }

  async function regression() {
    try {
      const file=
        currentSelectedFile();

      const body=
        await json(
          '/regression-plan',
          {
            method:'POST',
            headers:{
              'Content-Type':
                'application/json'
            },
            body:JSON.stringify({
              files:[file]
            })
          }
        );

      state.regression=body;
      render(body);

      setStatus(
        'Regression plan generated. Commands were not executed.'
      );
    } catch (error) {
      setStatus(
        `Regression analysis blocked: ${error.message}`
      );
    }
  }

  async function patchPlan() {
    try {
      const file=
        currentSelectedFile();

      const objective=
        document
          .getElementById(
            'ciwu-project-brain-objective'
          )
          ?.value
          ?.trim();

      if (!objective) {
        setStatus(
          'Enter a candidate change objective first.'
        );
        return;
      }

      const body=
        await json(
          '/candidate-patch-plan',
          {
            method:'POST',
            headers:{
              'Content-Type':
                'application/json'
            },
            body:JSON.stringify({
              objective,
              files:[file],
              symbols:[]
            })
          }
        );

      state.patchPlan=body;
      render(body);

      setStatus(
        'Candidate patch plan generated. No patch was generated or applied.'
      );
    } catch (error) {
      setStatus(
        `Candidate planning blocked: ${error.message}`
      );
    }
  }

  function bind() {
    document
      .getElementById(
        'ciwu-project-brain-load'
      )
      ?.addEventListener(
        'click',
        loadGraph
      );

    document
      .getElementById(
        'ciwu-project-brain-ground'
      )
      ?.addEventListener(
        'click',
        ground
      );

    document
      .getElementById(
        'ciwu-project-brain-regression'
      )
      ?.addEventListener(
        'click',
        regression
      );

    document
      .getElementById(
        'ciwu-project-brain-patch'
      )
      ?.addEventListener(
        'click',
        patchPlan
      );
  }

  function boot() {
    shell();
    bind();
  }

  window.CIWU_PROJECT_BRAIN={
    state,
    loadGraph,
    ground,
    regression,
    patchPlan
  };

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
