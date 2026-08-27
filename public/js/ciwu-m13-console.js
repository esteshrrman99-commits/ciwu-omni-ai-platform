(() => {
  'use strict';

  async function loadM13() {
    const status =
      document.getElementById(
        'ciwu-m13-status'
      );

    const evidence =
      document.getElementById(
        'ciwu-m13-evidence'
      );

    try {
      const [
        healthResponse,
        contactsResponse,
        evidenceResponse
      ] = await Promise.all([
        fetch('/api/m13/health'),
        fetch('/api/m13/contacts'),
        fetch('/api/m13/evidence-console')
      ]);

      if (
        !healthResponse.ok ||
        !contactsResponse.ok ||
        !evidenceResponse.ok
      ) {
        throw new Error('API');
      }

      const health =
        await healthResponse.json();

      const contacts =
        await contactsResponse.json();

      const consoleState =
        await evidenceResponse.json();

      document.getElementById(
        'ciwu-m13-wholesale'
      ).textContent =
        contacts.wholesale.email;

      document.getElementById(
        'ciwu-m13-phone'
      ).textContent =
        contacts.wholesale.phone;

      document.getElementById(
        'ciwu-m13-profile'
      ).textContent =
        health.private_business_profile;

      status.textContent =
        'M13 CONTACT WORKFLOW ONLINE';

      evidence.textContent =
        JSON.stringify(
          {
            state:
              consoleState.state,

            supplier_evidence:
              consoleState.rows.map(
                row => ({
                  supplier:
                    row.supplier_name,

                  manufacturer:
                    row.manufacturer_verified,

                  gmp:
                    row.gmp_verified,

                  coa:
                    row.coa_verified,

                  quote:
                    row.quote_received,

                  formula:
                    row.formula_received,

                  complete:
                    row.evidence_complete
                })
              ),

            purchase_authorization:
              'DISABLED',

            sales:
              'HARD DISABLED'
          },
          null,
          2
        );

    } catch {
      status.textContent =
        'M13 CONTACT WORKFLOW OFFLINE';

      evidence.textContent =
        'Evidence console unavailable.';
    }
  }

  document.addEventListener(
    'DOMContentLoaded',
    loadM13
  );
})();
