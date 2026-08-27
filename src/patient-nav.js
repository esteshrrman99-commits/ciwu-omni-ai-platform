const fs = require('fs');

class PatientNavigation {
  constructor() {
    this.insuranceData = {
      'BlueCross BlueShield': {
        formularies: ['Metformin', 'Rapamycin (off-label)', 'Vitamin D3', 'Omega-3'],
        priorAuth: ['Hyperbaric Oxygen', 'Stem Cell Therapy'],
        coverage: 'Partial for off-label use with documentation'
      },
      'Aetna': {
        formularies: ['Metformin', 'Berberine (supplement)', 'NMN (research only)'],
        priorAuth: ['Plasma Exchange', 'Cryotherapy'],
        coverage: 'Limited for longevity protocols'
      },
      'UnitedHealthcare': {
        formularies: ['Metformin', 'Resveratrol (supplement)', 'CoQ10'],
        priorAuth: ['HBOT', 'Gene Therapy Trials'],
        coverage: 'Case-by-case review'
      }
    };

    this.providerDirectory = [
      {
        name: 'Dr. Sarah Chen, MD',
        specialty: 'Integrative Medicine',
        npi: '1234567890',
        phone: '(555) 123-4567',
        email: 'dr.chen@longevitycenter.com',
        acceptsInsurance: ['BlueCross', 'Aetna', 'United'],
        telehealth: true,
        specialties: ['Longevity', 'Functional Medicine', 'Anti-Aging']
      },
      {
        name: 'Dr. Michael Torres, DO',
        specialty: 'Regenerative Medicine',
        npi: '0987654321',
        phone: '(555) 987-6543',
        email: 'dr.torres@stemcellclinic.com',
        acceptsInsurance: ['BlueCross', 'United'],
        telehealth: true,
        specialties: ['Stem Cell Therapy', 'Tissue Regeneration']
      },
      {
        name: 'Dr. Emily Watson, NP',
        specialty: 'Telehealth Longevity',
        npi: '1122334455',
        phone: '(555) 456-7890',
        email: 'np.watson@telelongevity.com',
        acceptsInsurance: ['Aetna', 'Cigna', 'Humana'],
        telehealth: true,
        specialties: ['Remote Monitoring', 'Supplement Protocols']
      }
    ];

    this.scripts = {
      'metformin': `
SCRIPT FOR CALLING DOCTOR ABOUT METFORMIN:

"Hello, I'm calling to schedule an appointment to discuss a longevity protocol I've researched. 
I have a family history of [condition] and I'm interested in exploring off-label metformin use 
for preventive health. I've prepared a packet with research studies and my family health history. 
Do you accept patients interested in integrative longevity approaches? 

If yes: Great! What insurance do you accept? My plan is [INSURANCE NAME].
If no: Could you recommend a colleague who specializes in functional/integrative medicine?"

KEY POINTS TO EMPHASIZE:
- You're seeking EDUCATION, not demanding a prescription
- You have research and family health data ready
- You're open to their professional assessment
- You want to work WITH them, not against them
`,
      'hyperbaric': `
SCRIPT FOR HBOT COVERAGE REQUEST:

"I'm researching hyperbaric oxygen therapy for [specific condition: wound healing, traumatic brain injury, etc.]. 
My doctor has recommended it as part of my treatment plan. Can you walk me through the prior 
authorization process? What documentation do you need from my provider? 

If denied: What appeals process is available? Are there clinical trials or alternative covered therapies?"
`,
      'supplements': `
SCRIPT FOR SUPPLEMENT DISCUSSION:

"I'm currently taking [list supplements] based on research from longevity experts. 
I'd like your professional opinion on whether these are safe given my medical history 
and current medications. Can we review potential interactions and adjust my protocol accordingly?"
`
    };
  }

  generateDiscussionPacket(patientData, desiredTreatment) {
    const packet = {
      header: `PATIENT DISCUSSION PACKET - ${new Date().toLocaleDateString()}`,
      patientInfo: patientData,
      treatmentRationale: this.getTreatmentRationale(desiredTreatment),
      researchSupport: this.getResearchSupport(desiredTreatment),
      insuranceCoverage: this.checkInsuranceCoverage(desiredTreatment),
      providerRecommendations: this.findMatchingProviders(patientData.insurance),
      discussionScript: this.getScript(desiredTreatment),
      disclaimer: `
DISCLAIMER: This document is for EDUCATIONAL PURPOSES ONLY. 
It is NOT medical advice, NOT a prescription, and NOT a diagnosis. 
All treatment decisions must be made in consultation with a licensed healthcare provider.
Patent Pending: US 64/037,249 - CIWU OMNI Longevity Platform Technology.
      `
    };

    return packet;
  }

  getTreatmentRationale(treatment) {
    const rationales = {
      'metformin': 'Metformin has shown promise in reducing age-related inflammation and improving metabolic health. The TAME Trial (Targeting Aging with Metformin) is investigating its potential to delay age-related conditions.',
      'rapamycin': 'Rapamycin has demonstrated lifespan extension in animal models and shows potential for immune system rejuvenation. Low-dose protocols are being studied in human trials.',
      'hbots': 'Hyperbaric oxygen therapy has FDA approval for specific conditions and emerging research suggests potential for cognitive enhancement and tissue repair.',
      'stemCells': 'Stem cell therapy shows promise for tissue regeneration and is FDA-approved for specific hematologic conditions. Clinical trials are ongoing for other applications.'
    };
    return rationales[treatment.toLowerCase()] || 'Research-based rationale pending.';
  }

  getResearchSupport(treatment) {
    return [
      'PubMed ID: 31537898 - Metformin and aging',
      'Nature Medicine 2021 - Rapamycin longevity trials',
      'JAMA Network Open 2022 - HBOT cognitive effects',
      'Cell Stem Cell 2023 - Stem cell regenerative potential'
    ];
  }

  checkInsuranceCoverage(treatment) {
    const coverage = [];
    for (const [insurer, data] of Object.entries(this.insuranceData)) {
      if (data.formularies.some(f => f.toLowerCase().includes(treatment.toLowerCase()))) {
        coverage.push(`${insurer}: Likely covered`);
      } else if (data.priorAuth.some(pa => pa.toLowerCase().includes(treatment.toLowerCase()))) {
        coverage.push(`${insurer}: Prior authorization required`);
      } else {
        coverage.push(`${insurer}: May require appeal or out-of-pocket`);
      }
    }
    return coverage;
  }

  findMatchingProviders(insuranceType) {
    return this.providerDirectory.filter(p => 
      p.acceptsInsurance.some(i => i.toLowerCase().includes(insuranceType.toLowerCase()))
    );
  }

  getScript(treatment) {
    const key = treatment.toLowerCase().replace(/[^a-z]/g, '');
    return this.scripts[key] || this.scripts['supplements'];
  }

  generatePresentation(patientData, treatment) {
    return {
      slides: [
        {
          title: 'Patient Health Overview',
          content: `Name: ${patientData.name}\nAge: ${patientData.age}\nKey Biomarkers: ${patientData.biomarkers.join(', ')}`
        },
        {
          title: 'Proposed Treatment: ' + treatment,
          content: this.getTreatmentRationale(treatment)
        },
        {
          title: 'Research Support',
          content: this.getResearchSupport(treatment).join('\n')
        },
        {
          title: 'Next Steps',
          content: 'Schedule consultation with licensed provider\nBring this packet to appointment\nDiscuss insurance coverage options'
        }
      ],
      patentReference: 'US Patent Application 64/037,249 - CIWU OMNI Platform',
      disclaimer: 'For educational purposes only. Consult licensed healthcare provider.'
    };
  }
}

module.exports = PatientNavigation;
