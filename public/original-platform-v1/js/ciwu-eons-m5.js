(() => {
  'use strict';

  const ID =
    'eons-m5-command';

  const createElement = (
    tag,
    className,
    text
  ) => {
    const node =
      document.createElement(tag);

    if (className) {
      node.className = className;
    }

    if (text != null) {
      node.textContent = text;
    }

    return node;
  };

  async function fetchStatus() {
    try {
      const response =
        await fetch(
          '/api/eons/intelligence/status',
          {
            headers: {
              Accept:
                'application/json'
            }
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  function mount() {
    if (
      document.getElementById(ID)
    ) {
      return;
    }

    const host =
      document.querySelector('main') ||
      document.body;

    const box =
      createElement('section');

    box.id = ID;

    const head =
      createElement(
        'div',
        'eons-m5-head'
      );

    head.append(
      createElement(
        'div',
        'eons-m5-title',
        'EONS M5.0 • CLINICAL INTELLIGENCE CORE'
      ),
      createElement(
        'div',
        'eons-m5-badge',
        'TRUTH LATTICE BOOTING'
      )
    );

    const grid =
      createElement(
        'div',
        'eons-m5-grid'
      );

    const cells = [
      [
        'Truth Engine',
        'Connecting…',
        'cyan'
      ],
      [
        'Evidence State',
        'Connecting…',
        'good'
      ],
      [
        'Patient Context',
        'Connecting…',
        ''
      ],
      [
        'Longitudinal Memory',
        'Connecting…',
        ''
      ]
    ];

    for (
      const [key, value, color]
      of cells
    ) {
      const cell =
        createElement(
          'div',
          'eons-m5-cell'
        );

      cell.append(
        createElement(
          'div',
          'eons-m5-k',
          key
        ),
        createElement(
          'div',
          `eons-m5-v ${color}`,
          value
        )
      );

      grid.append(cell);
    }

    box.append(
      head,
      grid,
      createElement(
        'div',
        'eons-m5-foot',
        'Evidence-aware reasoning • claim provenance • conflict resolution • lab trends • medication reasoning • treatment comparison • timeline memory'
      )
    );

    host.prepend(box);

    fetchStatus().then(status => {
      const badge =
        box.querySelector(
          '.eons-m5-badge'
        );

      const values =
        box.querySelectorAll(
          '.eons-m5-v'
        );

      if (status.success) {
        badge.textContent =
          '● SYSTEM ONLINE';

        const labels = [
          'TRUTH LATTICE',
          'PROVENANCE ACTIVE',
          'CONTEXT GRAPH',
          'TIMELINE READY'
        ];

        values.forEach(
          (node, index) => {
            node.textContent =
              labels[index];
          }
        );
      } else {
        badge.textContent =
          '● DEGRADED';

        values.forEach(node => {
          node.textContent =
            'UNAVAILABLE';
        });
      }
    });
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      mount
    );
  } else {
    mount();
  }
})();
