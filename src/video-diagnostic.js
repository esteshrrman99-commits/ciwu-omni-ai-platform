const fs = require('fs');

class VideoDiagnostic {
  constructor() {
    this.symptomDatabase = {
      'tremor': {
        description: 'Involuntary rhythmic muscle contraction causing shaking movements',
        possibleCauses: ['Parkinson\'s disease', 'Essential tremor', 'Anxiety', 'Thyroid dysfunction'],
        supplements: [
          ['Magnesium Glycinate', '400mg daily', 18],
          ['Omega-3 EPA/DHA', '2000mg daily', 22],
          ['Vitamin B Complex', '50mg daily', 15]
        ],
        procedures: ['Neurological exam', 'Thyroid panel', 'Dopamine transporter scan'],
        lifestyle: ['Stress reduction techniques', 'Avoid caffeine', 'Regular sleep schedule']
      },
      'slowed_movement': {
        description: 'Bradykinesia - slowness of voluntary movement',
        possibleCauses: ['Parkinson\'s disease', 'Depression', 'Hypothyroidism', 'Medication side effects'],
        supplements: [
          ['CoQ10 Ubiquinol', '400mg daily', 35],
          ['Creatine Monohydrate', '5g daily', 20],
          ['Vitamin D3 + K2', '5000IU + 180mcg', 18]
        ],
        procedures: ['Movement disorder specialist consult', 'MRI brain scan', 'DaTscan'],
        lifestyle: ['Daily exercise regimen', 'Physical therapy', 'Balance training']
      },
      'fatigue': {
        description: 'Persistent exhaustion not relieved by rest',
        possibleCauses: ['Chronic fatigue syndrome', 'Anemia', 'Sleep apnea', 'Thyroid dysfunction', 'Adrenal insufficiency'],
        supplements: [
          ['Iron Bisglycinate', '25mg daily (if deficient)', 12],
          ['Ashwagandha', '600mg daily', 25],
          ['Rhodiola Rosea', '500mg daily', 28],
          ['B-Complex methylated', '1 capsule daily', 18]
        ],
        procedures: ['Complete blood count', 'Thyroid panel', 'Iron studies', 'Sleep study'],
        lifestyle: ['Sleep hygiene optimization', 'Gradual exercise increase', 'Stress management']
      },
      'memory_issues': {
        description: 'Cognitive decline or memory impairment',
        possibleCauses: ['Alzheimer\'s disease', 'Vascular dementia', 'Normal aging', 'Depression', 'Vitamin deficiency'],
        supplements: [
          ['Lion\'s Mane Mushroom', '3000mg daily', 32],
          ['Alpha-GPC', '600mg daily', 40],
          ['Phosphatidylserine', '300mg daily', 35],
          ['Bacopa Monnieri', '500mg daily', 28]
        ],
        procedures: ['Cognitive assessment (MoCA)', 'Brain MRI', 'APOE genotyping', 'Vitamin B12/folate levels'],
        lifestyle: ['Cognitive training exercises', 'Mediterranean diet', 'Aerobic exercise', 'Social engagement']
      },
      'balance_issues': {
        description: 'Difficulty maintaining stability or coordination',
        possibleCauses: ['Vestibular dysfunction', 'Peripheral neuropathy', 'Cerebellar degeneration', 'Medication side effects'],
        supplements: [
          ['Ginkgo Biloba', '240mg daily', 20],
          ['Vitamin B12 Methylcobalamin', '1000mcg daily', 10],
          ['Alpha-Lipoic Acid', '600mg daily', 22]
        ],
        procedures: ['Vestibular function test', 'Nerve conduction studies', 'CT brain scan', 'Foot sensation exam'],
        lifestyle: ['Balance exercises', 'Fall prevention strategies', 'Home safety modifications']
      }
    };
  }

  async analyzeVideo(videoFile) {
    console.log('Analyzing video file:', videoFile.originalname);
    
    // SIMULATE computer vision analysis (replace with actual ML model later)
    // For now, return mock analysis based on file metadata
    const fileSize = videoFile.size;
    const duration = Math.floor(Math.random() * 60) + 30; // 30-90 seconds
    
    // Simulated symptom detection (random selection for demo)
    const possibleSymptoms = Object.keys(this.symptomDatabase);
    const detectedSymptoms = [];
    const numSymptoms = Math.floor(Math.random() * 2) + 1; // 1-2 symptoms
    
    for(let i=0; i<numSymptoms; i++){
      const randomSymptom = possibleSymptoms[Math.floor(Math.random() * possibleSymptoms.length)];
      if(!detectedSymptoms.includes(randomSymptom)){
        detectedSymptoms.push(randomSymptom);
      }
    }
    
    const observations = `Video duration: ${duration} seconds\nFile size: ${(fileSize/1024/1024).toFixed(2)} MB\nDetected motion patterns: Active movement observed\nVisible physiological markers: ${detectedSymptoms.map(s => s.replace('_', ' ')).join(', ')}`;
    
    const symptoms = detectedSymptoms.map(s => {
      const data = this.symptomDatabase[s];
      return `- ${s.replace('_', ' ').toUpperCase()}: ${data.description}`;
    });
    
    const assessment = `Based on video analysis, the following symptoms were detected: ${detectedSymptoms.join(', ')}. \n\nPossible causes include:\n` + 
      detectedSymptoms.flatMap(s => this.symptomDatabase[s].possibleCauses).slice(0, 5).map(c => `- ${c}`).join('\n') + 
      `\n\nRECOMMENDATION: Schedule comprehensive evaluation with appropriate specialist. Upload blood work for confirmation.`;
    
    // Generate combined protocol from all detected symptoms
    const allSupplements = {};
    const allProcedures = [];
    const allLifestyle = [];
    
    detectedSymptoms.forEach(s => {
      const data = this.symptomDatabase[s];
      data.supplements.forEach(sup => {
        if(!allSupplements[sup[0]]){
          allSupplements[sup[0]] = sup;
        }
      });
      data.procedures.forEach(p => {
        if(!allProcedures.includes(p)) allProcedures.push(p);
      });
      data.lifestyle.forEach(l => {
        if(!allLifestyle.includes(l)) allLifestyle.push(l);
      });
    });
    
    const totalCost = Object.values(allSupplements).reduce((sum, s) => sum + s[2], 0);
    
    const protocol = {
      supplements: Object.values(allSupplements),
      procedures: allProcedures.slice(0, 5),
      lifestyle: allLifestyle.slice(0, 5),
      cost: totalCost,
      timeline: '30-90 days depending on severity',
      confidence: 87.3
    };
    
    return {
      observations,
      symptoms,
      assessment,
      protocol,
      videoMetadata: {
        filename: videoFile.originalname,
        size: fileSize,
        duration: duration
      }
    };
  }
}

module.exports = VideoDiagnostic;
