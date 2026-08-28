(() => {
  'use strict';

  const API='/api/workbench';

  const state={
    selectedFile:null,
    searchResults:[],
    dependencyGraph:null,
    releases:[],
    context:null
  };

  async function request(
    path,
    options={}
  ) {
    const response=
      await fetch(
        `${API}${path}`,
        {
          cache:'no-store',
          headers:{
            Accept:'application/json',
            ...(options.headers || {})
          },
          ...options
        }
      );

    const body=
      await response.json();

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

  function el(
    tag,
    text=null,
    className=null
  ) {
    const node=
      document.createElement(tag);

    if (text !== null)
      node.textContent=text;

    if (className)
      node.className=className;

    return node;
  }

  function createShell() {
    const panel=
      document.querySelector(
        '[data-workbench-panel="repository"]'
      );

    if (
      !panel ||
      document.getElementById(
        'ciwu-project-intelligence'
      )
    ) {
      return;
    }

    const shell=el(
      'section',
      null,
      'ciwu-card ciwu-card-pad'
    );

    shell.id='ciwu-project-intelligence';
    shell.style.marginTop='14px';

    const eyebrow=el(
      'div',
      'PROJECT INTELLIGENCE',
      'ciwu-eyebrow'
    );

    const title=el(
      'h3',
      'Read-Only Source Intelligence'
    );

    const description=el(
      'p',
      'Inspect safe source files, search the project, map dependencies, compare releases, and assemble bounded M3 context without production mutation authority.',
      'ciwu-lead'
    );

    const searchRow=el(
      'div',
      null,
      'ciwu-row'
    );

    const input=
      document.createElement('input');

    input.id='ciwu-project-search-input';
    input.placeholder='Search project source';
    input.maxLength=120;
    input.autocomplete='off';

    const searchButton=el(
      'button',
      'Search',
      'ciwu-button'
    );

    searchButton.type='button';
    searchButton.id='ciwu-project-search-button';

    searchRow.append(
      input,
      searchButton
    );

    const status=el(
      'p',
      'Read-only project intelligence ready.'
    );

    status.id='ciwu-project-intelligence-status';

    const searchResults=el(
      'div'
    );

    searchResults.id=
      'ciwu-project-search-results';

    const fileViewer=el(
      'pre',
      'Select a safe file from repository inventory or search results.',
      'ciwu-diff'
    );

    fileViewer.id=
      'ciwu-project-file-viewer';

    const dependencySummary=el(
      'div',
      'Dependency graph not loaded.',
      'ciwu-evidence-record'
    );

    dependencySummary.id=
      'ciwu-dependency-summary';

    const releaseSummary=el(
      'div',
      'Release history not loaded.',
      'ciwu-evidence-record'
    );

    releaseSummary.id=
      'ciwu-release-summary';

    const contextButton=el(
      'button',
      'Assemble M3 Context',
      'ciwu-button'
    );

    contextButton.type='button';
    contextButton.id='ciwu-context-button';

    const contextOutput=el(
      'pre',
      'No context assembled.',
      'ciwu-diff'
    );

    contextOutput.id=
      'ciwu-context-output';

    shell.append(
      eyebrow,
      title,
      description,
      searchRow,
      status,
      searchResults,
      el('h3','Safe File Inspector'),
      fileViewer,
      el('h3','Dependency Intelligence'),
      dependencySummary,
      el('h3','Release Intelligence'),
      releaseSummary,
      contextButton,
      contextOutput
    );

    panel.appendChild(shell);
  }

  function setStatus(message) {
    const node=
      document.getElementById(
        'ciwu-project-intelligence-status'
      );

    if (node)
      node.textContent=message;
  }

  async function inspectFile(path) {
    try {
      setStatus(`Inspecting ${path}...`);

      const data=
        await request(
          `/file?path=${encodeURIComponent(path)}`
        );

      state.selectedFile=
        data.path;

      const viewer=
        document.getElementById(
          'ciwu-project-file-viewer'
        );

      if (viewer) {
        viewer.textContent=
          `FILE: ${data.path}\n`
          + `BYTES: ${data.bytes}\n`
          + `LINES: ${data.lineCount}\n\n`
          + data.content;
      }

      setStatus(
        `Read-only inspection loaded: ${data.path}`
      );
    } catch (error) {
      setStatus(
        `Inspection blocked: ${error.message}`
      );
    }
  }

  function bindRepositoryButtons() {
    document.addEventListener(
      'click',
      event => {
        const button=
          event.target.closest(
            '[data-file-path]'
          );

        if (!button)
          return;

        const path=
          button.dataset.filePath;

        if (
          path &&
          path.includes('.')
        ) {
          inspectFile(path);
        }
      }
    );
  }

  async function runSearch() {
    const input=
      document.getElementById(
        'ciwu-project-search-input'
      );

    const root=
      document.getElementById(
        'ciwu-project-search-results'
      );

    if (!input || !root)
      return;

    const query=
      input.value.trim();

    if (!query)
      return;

    root.replaceChildren();

    try {
      setStatus(
        `Searching for "${query}"...`
      );

      const data=
        await request(
          `/search?q=${encodeURIComponent(query)}`
        );

      state.searchResults=
        data.results || [];

      const summary=el(
        'p',
        `${data.resultCount} result(s) across ${data.filesScanned} inspected file(s).`
      );

      root.appendChild(summary);

      for (
        const result of
        state.searchResults.slice(0,80)
      ) {
        const row=el(
          'button',
          null,
          'ciwu-tree'
        );

        row.type='button';
        row.dataset.filePath=
          result.file;

        row.style.display='block';
        row.style.width='100%';

        row.textContent=
          `${result.file}:${result.line} — ${result.preview}`;

        root.appendChild(row);
      }

      setStatus(
        'Project search complete.'
      );
    } catch (error) {
      setStatus(
        `Search blocked: ${error.message}`
      );
    }
  }

  async function loadDependencies() {
    try {
      const data=
        await request(
          '/dependencies'
        );

      state.dependencyGraph=data;

      const target=
        document.getElementById(
          'ciwu-dependency-summary'
        );

      if (target) {
        target.textContent=
          `${data.nodeCount} JavaScript file node(s), ${data.edgeCount} dependency edge(s).`;
      }
    } catch (error) {
      setStatus(
        `Dependency graph unavailable: ${error.message}`
      );
    }
  }

  async function loadReleases() {
    try {
      const data=
        await request(
          '/releases'
        );

      state.releases=
        data.releases || [];

      const target=
        document.getElementById(
          'ciwu-release-summary'
        );

      if (!target)
        return;

      if (!state.releases.length) {
        target.textContent=
          'No certified release manifests found.';
        return;
      }

      const newest=
        state.releases[
          state.releases.length-1
        ];

      target.textContent=
        `${data.releaseCount} certified Ω120 release manifest(s). Latest: ${newest.generation || newest.file}, through M${newest.milestoneEnd}.`;
    } catch (error) {
      setStatus(
        `Release history unavailable: ${error.message}`
      );
    }
  }

  async function assembleContext() {
    const output=
      document.getElementById(
        'ciwu-context-output'
      );

    if (!output)
      return;

    try {
      const files=
        state.selectedFile
          ? [state.selectedFile]
          : [];

      const data=
        await request(
          '/context-assemble',
          {
            method:'POST',
            headers:{
              'Content-Type':'application/json'
            },
            body:JSON.stringify({
              files,
              symbols:[]
            })
          }
        );

      state.context=data;

      output.textContent=
        JSON.stringify(
          {
            readOnly:data.readOnly,
            mutationAuthority:
              data.mutationAuthority,
            executionAuthority:
              data.executionAuthority,
            gitPushAuthority:
              data.gitPushAuthority,
            purchaseAuthority:
              data.purchaseAuthority,
            sectionCount:
              data.sectionCount,
            approximateChars:
              data.approximateChars,
            sections:
              data.sections
          },
          null,
          2
        );

      setStatus(
        'Bounded M3 project context assembled.'
      );
    } catch (error) {
      setStatus(
        `Context assembly blocked: ${error.message}`
      );
    }
  }

  function bindControls() {
    const search=
      document.getElementById(
        'ciwu-project-search-button'
      );

    if (search) {
      search.addEventListener(
        'click',
        runSearch
      );
    }

    const input=
      document.getElementById(
        'ciwu-project-search-input'
      );

    if (input) {
      input.addEventListener(
        'keydown',
        event => {
          if (event.key === 'Enter')
            runSearch();
        }
      );
    }

    const context=
      document.getElementById(
        'ciwu-context-button'
      );

    if (context) {
      context.addEventListener(
        'click',
        assembleContext
      );
    }
  }

  async function boot() {
    createShell();
    bindControls();
    bindRepositoryButtons();

    await Promise.all([
      loadDependencies(),
      loadReleases()
    ]);
  }

  window.CIWU_PROJECT_INTELLIGENCE={
    state,
    inspectFile,
    search:runSearch,
    assembleContext
  };

  document.addEventListener(
    'DOMContentLoaded',
    boot
  );
})();
