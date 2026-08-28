(() => {
  'use strict';

  const STORAGE_KEY='ciwu.omni.workbench.v1';

  const state={
    project:'CIWU OMNI',
    activePanel:'projects',
    selectedFile:null,
    selectedProvider:null,
    selectedEvidenceState:'ALL'
  };

  const $=(selector,root=document) =>
    root.querySelector(selector);

  const $$=(selector,root=document) =>
    [...root.querySelectorAll(selector)];

  function safeParse(value,fallback={}) {
    try {
      return JSON.parse(value);
    } catch (_) {
      return fallback;
    }
  }

  function load() {
    const saved=safeParse(
      localStorage.getItem(STORAGE_KEY),
      {}
    );

    Object.assign(state,saved);
  }

  function save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  }

  function setPanel(panel) {
    state.activePanel=panel;
    save();

    $$('.ciwu-workbench-panel')
      .forEach(el => {
        el.hidden=
          el.dataset.workbenchPanel !== panel;
      });

    $$('[data-workbench-target]')
      .forEach(el => {
        el.classList.toggle(
          'active',
          el.dataset.workbenchTarget === panel
        );
      });
  }

  function bindTabs() {
    $$('[data-workbench-target]')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => setPanel(
            button.dataset.workbenchTarget
          )
        );
      });
  }

  function bindFileExplorer() {
    $$('[data-file-path]')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            state.selectedFile=
              button.dataset.filePath;
            save();

            const target=
              $('#ciwu-selected-file');

            if (target)
              target.textContent=
                state.selectedFile;
          }
        );
      });
  }

  function bindProviderCards() {
    $$('[data-provider-name]')
      .forEach(card => {
        card.addEventListener(
          'click',
          () => {
            state.selectedProvider=
              card.dataset.providerName;
            save();

            const target=
              $('#ciwu-selected-provider');

            if (target)
              target.textContent=
                state.selectedProvider;
          }
        );
      });
  }

  function bindEvidenceFilters() {
    $$('[data-evidence-state]')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            const selected=
              button.dataset.evidenceState;

            state.selectedEvidenceState=selected;
            save();

            $$('[data-evidence-record]')
              .forEach(record => {
                const stateName=
                  record.dataset.evidenceRecord;

                record.hidden=
                  selected !== 'ALL' &&
                  selected !== stateName;
              });
          }
        );
      });
  }

  function boot() {
    load();
    bindTabs();
    bindFileExplorer();
    bindProviderCards();
    bindEvidenceFilters();
    setPanel(state.activePanel || 'projects');

    const file=$('#ciwu-selected-file');
    if (file && state.selectedFile)
      file.textContent=state.selectedFile;

    const provider=$('#ciwu-selected-provider');
    if (provider && state.selectedProvider)
      provider.textContent=state.selectedProvider;
  }

  window.CIWU_WORKBENCH={
    state,
    setPanel,
    save
  };

  document.addEventListener(
    'DOMContentLoaded',
    boot
  );
})();
