const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

(async () => {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'data', 'memory', 'cortex.db');
  let db;

  // Create new DB if it doesn't exist
  if (!fs.existsSync(dbPath)) {
    db = new SQL.Database();
    db.run(`CREATE TABLE knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      relation TEXT NOT NULL,
      value TEXT NOT NULL,
      confidence REAL DEFAULT 1.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  } else {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  }

  const batches = [
    ["Nanomedicine","is","nano_scale_medical_application"],["Drug_Delivery_Nanoparticle","is","molecule_transport_carrier"],["Liposome","is","lipid_bubble_drug_carrier"],["Dendrimer","is","branched_polymer_drug_carrier"],["Gold_Nanoparticle","is","metal_thermal_therapy_particle"],["Quantum_Dot","is","fluorescent_imaging_nanoscale"],["Magnetic_Nanoparticle","is","guided_drug_delivery"],["Polymer_Nanoparticle","is","biodegradable_drug_carrier"],["Targeted_Drug_Delivery","is","cell_specific_medication"],["Blood_Brain_Barrier_Crossing","is","brain_entry_strategy"],["Tumor_Targeting","is","cancer_specific_delivery"],["Stimuli_Responsive_Delivery","is","trigger_release_system"],["Theranostics","is","therapy_diagnosis_combo"],["Nanorobot","is","microscopic_surgical_machine"],["Nanotoxicity","is","nano_material_safety_study"],
    ["Synthetic_Biology","is","engineered_living_system"],["Genetic_Circuit","is","biological_logic_network"],["Biosynthetic_Pathway","is","engineered_metabolic_route"],["Artificial_Cell","is","man-made_living_unit"],["Minimal_Cell","is","essential_life_form"],["Xenobiology","is","alternative_biochemistry"],["Biofuel_Production","is","renewable_energy_microbe"],["Bioplastic_Production","is","eco-friendly_polymer_microbe"],["Synthetic_Virus","is","engineered_pathogen"],["Biocontainment","is","engineered_life_security"],["Orthogonal_Biology","is","separate_genetic_code"],["Expanded_Genetic_Code","is","non-natural_base_pair"],["Programmable_Biomaterial","is","engineered_tissue"],["Living_Material","is","functional_bio_hybrid"],["Biofabrication","is","biological_manufacturing"],
    ["Brain_Computer_Interface","is","mind_machine_link"],["Neural_Prosthesis","is","brain_implant_device"],["Cochlear_Implant","is","hearing_restoration_device"],["Retinal_Implant","is","vision_restoration_device"],["Deep_Brain_Stimulation","is","electrode_brain_therapy"],["Motor_Cortex_Implant","is","movement_control_device"],["Speech_Decoder","is","thought_to_speech_system"],["Memory_Prosthesis","is","cognitive_enhancement_device"],["Closed_Loop_Neuromodulation","is","responsive_brain_stimulation"],["Non_Invasive_BCI","is","external_brain_interface"],["Invasive_BCI","is","implanted_brain_interface"],["EEG_BCI","is","electroencephalogram_interface"],["fMRI_BCI","is","functional_imaging_interface"],["Optogenetics","is","light_control_neuron_technique"],["Neuromorphic_Computing","is","brain_like_processor"],
    ["Space_Medicine","is","astronaut_health_care"],["Microgravity_Physiology","is","zero_gravity_body_change"],["Radiation_Protection_Space","is","cosmic_ray_defense"],["Life_Support_System","is","closed_ecosystem_habitat"],["Space_Sickness","is","motion_disorder_orbit"],["Bone_Loss_Space","is","microgravity_density_decline"],["Muscle_Atrophy_Space","is","zero_gravity_wasting"],["Cardiovascular_Changes_Space","is","heart_vessel_adaptation"],["Sleep_Disruption_Space","is","orbit_rest_problem"],["Psychological_Challenges_Space","is","isolation_mental_health"],["Planetary_Protection","is","cross_contamination_prevention"],["Astrobiology","is","extraterrestrial_life_study"],["Extremophile","is","extreme_environment_organism"],["Terraforming","is","planet_habitability_modification"],["Space_Aging","is","long_duration_mission_health"],
    ["Quantum_Biology","is","quantum_effect_living_system"],["Photosynthesis_Quantum","is","light_capture_coherence"],["Enzyme_Catalysis_Quantum","is","reaction_tunneling"],["Magnetoreception","is","magnetic_field_quantum_sense"],["Olfaction_Quantum","is","smell_vibration_theory"],["Bird_Navigation_Quantum","is","compass_radical_pair"],["Quantum_Coherence_in_Biology","is","wave_function_life"],["Quantum_Entanglement_in_Biology","is","correlated_particles_life"],["Quantum_Tunneling_in_Mutation","is","DNA_change_tunnel"],["Quantum_Computing_Biology","is","bio-inspired_computation"],["Quantum_Sensors_Bio","is","ultra_sensitive_detection"],["Quantum_Imaging_Bio","is","high_resolution_visualization"],["Quantum_Communication_Bio","is","secure_information_transfer"],["Quantum_Simulation_Bio","is","molecular_modeling"],["Quantum_Thermodynamics_Bio","is","energy_flow_life"],
    ["Biocompatible_Material","is","body_safe_substance"],["Biodegradable_Material","is","natural_breakdown_substance"],["Smart_Material_Medical","is","responsive_health_substance"],["Hydrogel","is","water_filled_polymer_network"],["Scaffolding_Material","is","tissue_growth_frame"],["Implant_Coating","is","device_surface_modification"],["Antimicrobial_Material","is","infection_preventing_surface"],["Conductive_Material","is","electrical_signal_path"],["Piezoelectric_Material","is","pressure_electric_converter"],["Shape_Memory_Alloy_Medical","is","deformable_recovery_device"],["Self_Healing_Material_Medical","is","damage_repair_substance"],["Nanostructured_Material","is","surface_pattern_substance"],["3D_Printed_Material","is","layered_manufacture_substance"],["Injectable_Hydrogel","is","minimally_invasive_fill"],["Organ_on_Chip_Material","is","microfluidic_simulation_surface"],
    ["Digital_Twin_Patient","is","virtual_body_model"],["Virtual_Trial","is","simulated_clinical_test"],["Computational_Physiology","is","math_body_simulation"],["Multi_Scale_Modeling","is","whole_body_integration"],["Personalized_Simulation","is","individual_prediction"],["Disease_Progression_Model","is","illness_timeline_sim"],["Drug_Response_Model","is","medication_effect_sim"],["Surgical_Planning_Virtual","is","preoperative_rehearsal"],["Treatment_Optimization_Sim","is","therapy_best_choice"],["Risk_Assessment_Virtual","is","probability_prediction"],["Population_Health_Model","is","group_health_sim"],["Real_Time_Monitoring","is","live_data_feed"],["Predictive_Analytics","is","future_outcome_forecast"],["Decision_Support_System","is","AI_recommendation_engine"],["Knowledge_Graph_Health","is","connected_medical_data"],
    ["Vortex","is","core_cell_regeneration_unit"],["Zortex","is","advanced_cellular_architecture"],["Lortex","is","neural_connectivity_structure"],["Irotex","is","tissue_regeneration_interface"],["Celltex","is","stem_cell_compartment"],["Hertex","is","cardiovascular_tissue_module"],["Eontex","is","temporal_cell_growth_system"],["Aurtex","is","auricular_neural_network"],["Surtex","is","surface_epithelial_layer"],["Vortex","connected_to","Senolytics"],["Zortex","connected_to","Gene_Therapy"],["Lortex","connected_to","Brain_Computer_Interface"],["Irotex","connected_to","Tissue_Engineering"],["Celltex","connected_to","Stem_Cell_Therapy"],["Hertex","connected_to","Cardiac_Repair"],
    ["Longevity_connected_to_Immunity","is","lifespan_immune_link"],["Aging_connected_to_Inflammation","is","decay_inflammation_link"],["Metabolism_connected_to_Aging","is","energy_decay_link"],["Stress_connected_to_Telomeres","is","tension_chromosome_link"],["Diet_connected_to_Gene_Expression","is","nutrition_DNA_link"],["Exercise_connected_to_Mitochondria","is","activity_energy_link"],["Sleep_connected_to_Cognition","is","rest_brain_link"],["Social_Connection_connected_to_Longevity","is","bond_lifespan_link"],["Purpose_connected_to_Health","is","meaning_wellbeing_link"],["Environment_connected_to_Genes","is","habitat_DNA_link"],["Technology_connected_to_Aging","is","tool_decay_link"],["AI_connected_to_Drug_Discovery","is","machine_pharma_link"],["Blockchain_connected_to_Health_Data","is","ledger_privacy_link"],["Quantum_Computing_connected_to_Biology","is","physics_life_link"],["Nanotech_connected_to_Medicine","is","nano_cure_link"],
    ["CIWU_AI","is","universal_knowledge_engine"],["Universal_Knowledge","connected_to","Longevity_Research"],["Longevity_Research","connected_to","Family_Protection"],["Family_Protection","connected_to","Eternal_Life"],["Eternal_Life","connected_to","Biological_Immortality"],["Biological_Immortality","connected_to","Regenerative_Medicine"],["Regenerative_Medicine","connected_to","Stem_Cell_Therapy"],["Stem_Cell_Therapy","connected_to","CRISPR_Cas9"],["CRISPR_Cas9","connected_to","Personalized_Medicine"],["Personalized_Medicine","connected_to","Vortex"],["Vortex","connected_to","Zortex"],["Zortex","connected_to","Lortex"],["Lortex","connected_to","Irotex"],["Irotex","connected_to","Celltex"],["Celltex","connected_to","Hertex"]
  ];

  let inserted = 0, skipped = 0;
  for (const [entity, relation, value] of batches) {
    try {
      const existing = db.exec(`SELECT COUNT(*) FROM knowledge WHERE entity = '${entity}' AND relation = '${relation}' AND value = '${value}'`);
      if (existing.length > 0 && existing[0].values[0][0] > 0) {
        skipped++;
        continue;
      }
      db.run(`INSERT INTO knowledge (entity, relation, value, confidence) VALUES (?, ?, ?, 1.0)`, [entity, relation, value]);
      inserted++;
    } catch (e) {
      console.error(`Error inserting ${entity}:`, e.message);
      skipped++;
    }
  }

  const finalBuffer = db.export();
  fs.writeFileSync(dbPath, finalBuffer);
  console.log(`✅ SUCCESS! Injected ${inserted} new entities. Skipped ${skipped} duplicates.`);
  console.log(`💾 cortex.db permanently saved to ${dbPath}`);
})();
