require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../www')));

let dbCortex, dbEons;

// ORIGINAL KNOWLEDGE FACTS (small, inline - 150 facts)
const embeddedKnowledge = [
  ["Nanomedicine","is","nano_scale_medical_application"],["Drug_Delivery_Nanoparticle","is","molecule_transport_carrier"],["Liposome","is","lipid_bubble_drug_carrier"],["Dendrimer","is","branched_polymer_drug_carrier"],["Gold_Nanoparticle","is","metal_thermal_therapy_particle"],["Quantum_Dot","is","fluorescent_imaging_nanoscale"],["Magnetic_Nanoparticle","is","guided_drug_delivery"],["Polymer_Nanoparticle","is","biodegradable_drug_carrier"],["Targeted_Drug_Delivery","is","cell_specific_medication"],["Blood_Brain_Barrier_Crossing","is","brain_entry_strategy"],["Tumor_Targeting","is","cancer_specific_delivery"],["Stimuli_Responsive_Delivery","is","trigger_release_system"],["Theranostics","is","therapy_diagnosis_combo"],["Nanorobot","is","microscopic_surgical_machine"],["Nanotoxicity","is","nano_material_safety_study"],
  ["Synthetic_Biology","is","engineered_living_system"],["Genetic_Circuit","is","biological_logic_network"],["Biosynthetic_Pathway","is","engineered_metabolic_route"],["Artificial_Cell","is","man-made_living_unit"],["Minimal_Cell","is","essential_life_form"],["Xenobiology","is","alternative_biochemistry"],["Biofuel_Production","is","renewable_energy_microbe"],["Bioplastic_Production","is","eco-friendly_polymer_microbe"],["Synthetic_Virus","is","engineered_pathogen"],["Biocontainment","is","engineered_life_security"],["Orthogonal_Biology","is","separate_genetic_code"],["Expanded_Genetic_Code","is","non-natural-base_pair"],["Programmable_Biomaterial","is","engineered_tissue"],["Living_Material","is","functional_bio_hybrid"],["Biofabrication","is","biological_manufacturing"],
  ["Brain_Computer_Interface","is","mind_machine_link"],["Neural_Prosthesis","is","brain_implant_device"],["Cochlear_Implant","is","hearing_restoration_device"],["Retinal_Implant","is","vision_restoration_device"],["Deep_Brain_Stimulation","is","electrode_brain_therapy"],["Motor_Cortex_Implant","is","movement_control_device"],["Speech_Decoder","is","thought_to_speech_system"],["Memory_Prosthesis","is","cognitive_enhancement_device"],["Closed_Loop_Neuromodulation","is","responsive_brain_stimulation"],["Non_Invasive_BCI","is","external_brain_interface"],["Invasive_BCI","is","implanted_brain_interface"],["EEG_BCI","is","electroencephalogram_interface"],["fMRI_BCI","is","functional_imaging_interface"],["Optogenetics","is","light_control_neuron_technique"],["Neuromorphic_Computing","is","brain_like_processor"],
  ["Space_Medicine","is","astronaut_health_care"],["Microgravity_Physiology","is","zero_gravity_body_change"],["Radiation_Protection_Space","is","cosmic_ray_defense"],["Life_Support_System","is","closed_ecosystem_habitat"],["Space_Sickness","is","motion_disorder_orbit"],["Bone_Loss_Space","is","microgravity_density_decline"],["Muscle_Atrophy_Space","is","zero_gravity_wasting"],["Cardiovascular_Changes_Space","is","heart_vessel_adaptation"],["Sleep_Disruption_Space","is","orbit_rest_problem"],["Psychological_Challenges_Space","is","isolation_mental_health"],["Planetary_Protection","is","cross_contamination_prevention"],["Astrobiology","is","extraterrestrial_life_study"],["Extremophile","is","extreme_environment_organism"],["Terraforming","is","planet_habitability_modification"],["Space_Aging","is","long_duration_mission_health"],
  ["Quantum_Biology","is","quantum_effect_living_system"],["Photosynthesis_Quantum","is","light_capture_coherence"],["Enzyme_Catalysis_Quantum","is","reaction_tunneling"],["Magnetoreception","is","magnetic_field_quantum_sense"],["Olfaction_Quantum","is","smell_vibration_theory"],["Bird_Navigation_Quantum","is","compass_radical_pair"],["Quantum_Coherence_in_Biology","is","wave_function_life"],["Quantum_Entanglement_in_Biology","is","correlated_particles_life"],["Quantum_Tunneling_in_Mutation","is","DNA_change_tunnel"],["Quantum_Computing_Biology","is","bio-inspired_computation"],["Quantum_Sensors_Bio","is","ultra_sensitive_detection"],["Quantum_Imaging_Bio","is","high_resolution_visualization"],["Quantum_Communication_Bio","is","secure_information_transfer"],["Quantum_Simulation_Bio","is","molecular_modeling"],["Quantum_Thermodynamics_Bio","is","energy_flow_life"],
  ["Biocompatible_Material","is","body_safe_substance"],["Biodegradable_Material","is","natural_breakdown_substance"],["Smart_Material_Medical","is","responsive_health_substance"],["Hydrogel","is","water_filled_polymer_network"],["Scaffolding_Material","is","tissue_growth_frame"],["Implant_Coating","is","device_surface_modification"],["Antimicrobial_Material","is","infection_preventing_surface"],["Conductive_Material","is","electrical_signal_path"],["Piezoelectric_Material","is","pressure_electric_converter"],["Shape_Memory_Alloy_Medical","is","deformable_recovery_device"],["Self_Healing_Material_Medical","is","damage_repair_substance"],["Nanostructured_Material","is","surface_pattern_substance"],["3D_Printed_Material","is","layered_manufacture_substance"],["Injectable_Hydrogel","is","minimally_invasive_fill"],["Organ_on_Chip_Material","is","microfluidic_simulation_surface"],
  ["Digital_Twin_Patient","is","virtual_body_model"],["Virtual_Trial","is","simulated_clinical_test"],["Computational_Physiology","is","math_body_simulation"],["Multi_Scale_Modeling","is","whole_body_integration"],["Personalized_Simulation","is","individual_prediction"],["Disease_Progression_Model","is","illness_timeline_sim"],["Drug_Response_Model","is","medication_effect_sim"],["Surgical_Planning_Virtual","is","preoperative_rehearsal"],["Treatment_Optimization_Sim","is","therapy_best_choice"],["Risk_Assessment_Virtual","is","probability_prediction"],["Population_Health_Model","is","group_health_sim"],["Real_Time_Monitoring","is","live_data_feed"],["Predictive_Analytics","is","future_outcome_forecast"],["Decision_Support_System","is","AI_recommendation_engine"],["Knowledge_Graph_Health","is","connected_medical_data"],
  ["Vortex","is","core_cell_regeneration_unit"],["Zortex","is","advanced_cellular_architecture"],["Lortex","is","neural_connectivity_structure"],["Irotex","is","tissue_regeneration_interface"],["Celltex","is","stem_cell_compartment"],["Hertex","is","cardiovascular_tissue_module"],["Eontex","is","temporal_cell_growth_system"],["Aurtex","is","auricular_neural_network"],["Surtex","is","surface_epithelial_layer"],["Vortex","connected_to","Senolytics"],["Zortex","connected_to","Gene_Therapy"],["Lortex","connected_to","Brain_Computer_Interface"],["Irotex","connected_to","Tissue_Engineering"],["Celltex","connected_to","Stem_Cell_Therapy"],["Hertex","connected_to","Cardiac_Repair"],
  ["Longevity_connected_to_Immunity","is","lifespan_immune_link"],["Aging_connected_to_Inflammation","is","decay_inflammation_link"],["Metabolism_connected_to_Aging","is","energy_decay_link"],["Stress_connected_to_Telomeres","is","tension_chromosome_link"],["Diet_connected_to_Gene_Expression","is","nutrition_DNA_link"],["Exercise_connected_to_Mitochondria","is","activity_energy_link"],["Sleep_connected_to_Cognition","is","rest_brain_link"],["Social_Connection_connected_to_Longevity","is","bond_lifespan_link"],["Purpose_connected_to_Health","is","meaning_wellbeing_link"],["Environment_connected_to_Genes","is","habitat_DNA_link"],["Technology_connected_to_Aging","is","tool_decay_link"],["AI_connected_to_Drug_Discovery","is","machine_pharma_link"],["Blockchain_connected_to_Health_Data","is","ledger_privacy_link"],["Quantum_Computing_connected_to_Biology","is","physics_life_link"],["Nanotech_connected_to_Medicine","is","nano_cure_link"],
  ["CIWU_AI","is","universal_knowledge_engine"],["Universal_Knowledge","connected_to","Longevity_Research"],["Longevity_Research","connected_to","Family_Protection"],["Family_Protection","connected_to","Eternal_Life"],["Eternal_Life","connected_to","Biological_Immortality"],["Biological_Immortality","connected_to","Regenerative_Medicine"],["Regenerative_Medicine","connected_to","Stem_Cell_Therapy"],["Stem_Cell_Therapy","connected_to","CRISPR_Cas9"],["CRISPR_Cas9","connected_to","Personalized_Medicine"],["Personalized_Medicine","connected_to","Vortex"],["Vortex","connected_to","Zortex"],["Zortex","connected_to","Lortex"],["Lortex","connected_to","Irotex"],["Irotex","connected_to","Celltex"],["Celltex","connected_to","Hertex"]
];

(async () => {
  const SQL = await initSqlJs();
  
  dbCortex = new SQL.Database();
  dbEons = new SQL.Database();
  
  dbCortex.run(`CREATE TABLE knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity TEXT NOT NULL,
    relation TEXT NOT NULL,
    value TEXT NOT NULL,
    confidence REAL DEFAULT 1.0
  )`);
  
  dbEons.run(`CREATE TABLE entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    description TEXT
  )`);
  dbEons.run(`CREATE TABLE relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    relation_type TEXT
  )`);

  // Insert knowledge facts (inline - small)
  embeddedKnowledge.forEach(([entity, relation, value]) => {
    dbCortex.run(`INSERT INTO knowledge (entity, relation, value) VALUES (?, ?, ?)`, [entity, relation, value]);
  });

  // Load entities and relations from JSON file at runtime
  const dataPath = path.join(__dirname, '..', 'data', 'ciwu_master_export.json');
  let entityCount = 0;
  let relationCount = 0;

  try {
    if (fs.existsSync(dataPath)) {
      console.log('📦 Loading data from JSON file...');
      const masterData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      
      if (masterData.data && masterData.data.entities) {
        masterData.data.entities.forEach((item, idx) => {
        try {
          let name, type, desc;
          if (Array.isArray(item) && item.length >= 3) {
            [name, type, desc] = item;
          } else if (typeof item === 'object' && item.name) {
            name = item.name;
            type = item.type || item.Type || 'unknown';
            desc = item.description || item.desc || '';
          } else {
            return;
          }
          dbEons.run('INSERT INTO entities (name, type, description) VALUES (?, ?, ?)', [name, type, desc]);
        } catch (err) {
          if (idx < 3) console.error('Entity error', idx, err.message);
        }
      });
        entityCount = masterData.data.entities.length;
      }
      
      if (masterData.data && masterData.data.relations) {
        masterData.data.relations.forEach((item, idx) => {
        try {
          let source, rel, target;
          if (Array.isArray(item) && item.length >= 3) {
            [source, rel, target] = item;
          } else if (typeof item === 'object' && item.source) {
            source = item.source;
            target = item.target;
            rel = item.relation_type || item.relationType || item.type || 'related';
          } else {
            return;
          }
          dbEons.run('INSERT INTO relations (source, target, relation_type) VALUES (?, ?, ?)', [source, target, rel]);
        } catch (err) {
          if (idx < 3) console.error('Relation error', idx, err.message);
        }
      });
        relationCount = masterData.data.relations.length;
      }
      
      console.log(`✅ Loaded from JSON: ${entityCount} entities, ${relationCount} relations`);
    } else {
      // Fallback: load embedded entities from the file
      console.log('⚠️ JSON file not found, using embedded fallback...');
      
      const embeddedEntities = [
        ["Stem_Cell_Therapy","technology","regenerative_medicine_core"],["CRISPR_Gene_Edition","technology","precise_dna_manipulation"],["Telomere_Extension","therapy","chromosome_lengthening"],["Senolytics","drug_class","aged_cell_clearance"],["NAD_Boosters","supplement","metabolic_activation"],["Mitochondrial_Therapy","treatment","cellular_energy_repair"],["Epigenetic_Reprogramming","therapy","age_reset_protocol"],["Organ_3D_Printing","manufacturing","biofabricated_organs"],["Synthetic_Organoid","research","miniature_organs"],["Gene_Silencing_RNA","treatment","protein_production_block"],["Protein_Therapy","medicine","enzymatic_replacement"],["Peptide_Signaling","therapy","cell_communication_modulation"],["Hormone_Optimization","treatment","endocrine_balance"],["Immune_Reprogramming","therapy","autoimmune_correction"],["Microbiome_Engineering","treatment","gut_flora_optimization"],["Nutrigenomics","science","diet_gene_interaction"],["Metabolic_Flexibility","state","energy_source_adaptation"],["Autophagy_Enhancement","process","cellular_cleaning"],["Heat_Shock_Proteins","therapy","stress_response_boost"],["Sirtuin_Activation","pathway","longevity_enzyme_activation"],
        ["CIWU_Neural_Network","ai_system","family_protection_engine"],["Knowledge_Graph","database","connected_information"],["Machine_Learning_Model","algorithm","pattern_recognition"],["Natural_Language_Processing","technology","text_understanding"],["Computer_Vision","ai_capability","visual_interpretation"],["Predictive_Analytics","analysis","future_outcome_forecasting"],["Anomaly_Detection","security","irregularity_identification"],["Automated_Decision_System","ai","rule_based_choices"],["Expert_System","ai","domain_knowledge_replication"],["Reinforcement_Learning","ml_method","trial_error_optimization"],["Deep_Learning_Network","ai_architecture","multi_layer_processing"],["Transfer_Learning","technique","knowledge_reuse"],["Federated_Learning","privacy","distributed_training"],["Quantum_Machine_Learning","frontier","quantum_ai_hybrid"],["Explainable_AI","transparency","decision_interpretability"],
        ["Hayflick_Limit","concept","cell_division_maximum"],["Telomere_Length","marker","biological_age_indicator"],["Senescent_Cell","phenotype","zombie_cell_accumulation_inflammation"],["Inflammaging","process","chronic_low_grade_inflammation"],["Geroscience","field","aging_as_root_cause"],["Healthspan","goal","healthy_years_maximization"],["Compression_of_Morbidity","theory","illness_period_reduction"],["Blue_Zones","geography","longevity_hotspots"],["Centenarian","population","100_plus_years_lived"],["Superager","subset","exceptional_cognitive_retention"],["Longevity_Dispensary","facility","anti-aging_treatment_center"],["Wellness_Tourism","industry","health_travel"],["Biohacking","practice","self_experimentation"],["Graying_of_America","demographic","aging_population_trend"],["Demographic_Transition","trend","birth_death_rate_shift"],
        ["Mother_Profile","patient","primary_family_member"],["Wife_Profile","patient","secondary_family_member"],["Children_Profile","patients","generational_protection"],["Father_Profile","patient","elder_care_target"],["Extended_Family","members","kinship_network"],["Genetic_Predisposition","risk","hereditary_conditions"],["Family_History","record","medical_lineage_data"],["Heritable_Trait","characteristic","passed_down_features"],["Polygenic_Risk_Score","metric","multiple_gene_vulnerability"],["Pharmacogenomics","field","drug_response_genetics"],["Carrier_Status","condition","recessive_gene_holder"],["De_Novo_Mutation","event","spontaneous_gene_change"],["Mosaicism","state","mixed_cell_genetics"],["Epigenetic_Inheritance","mechanism","non-DNA_transmission"],["Transgenerational_Effect","phenomenon","ancestor_impact_descendant"],
        ["Zortex_Matrix","technology","advanced_cellular_architecture"],["Neurotex_Core","system","neural_connectivity_optimization"],["Vortex_Engine","unit","core_cell_regeneration"],["Lortex_Structure","framework","brain_tissue_connection"],["Irotex_Interface","gateway","tissue_repair_portal"],["Celltex_Module","compartment","stem_cell_storage"],["Hertex_Unit","module","cardiovascular_support"],["Eontex_System","platform","temporal_growth_management"],["Aurtex_Network","grid","ear_healing_array"],["Surtex_Layer","membrane","surface_protection_barrier"],["Cyborg_Integration","fusion","human_machine_merge"],["Bionic_Enhancement","upgrade","artificial_part_implant"],["Neural_lace","interface","brain_network_connection"],["Synthetic_Organ","replacement","man-made_body_part"],["Augmented_Reality_Medical","visualization","overlay_diagnostic_tool"]
      ];
      
      const embeddedRelations = [
        ["Stem_Cell_Therapy","treats","Age_related_macular_degeneration"],["Stem_Cell_Therapy","treats","Spinal_cord_injury"],["Stem_Cell_Therapy","treats","Parkinsons_disease"],["CRISPR_Gene_Edition","corrects","Sickle_cell_disease"],["CRISPR_Gene_Edition","corrects","Cystic_fibrosis"],["CRISPR_Gene_Edition","corrects","Huntingtons_disease"],["Telomere_Extension","extends","Cellular_lifespan"],["Telomere_Extension","delays","Aging_markers"],["Senolytics","clears","Senescent_cells"],["Senolytics","reduces","Inflammaging"],["NAD_Boosters","increases","Cellular_energy"],["NAD_Boosters","supports","DNA_repair"],["Mitochondrial_Therapy","enhances","ATP_production"],["Mitochondrial_Therapy","protects","Cardiomyocytes"],["Epigenetic_Reprogramming","resets","Cellular_age"]
      ];

      embeddedEntities.forEach(([name, type, desc]) => {
        dbEons.run(`INSERT INTO entities (name, type, description) VALUES (?, ?, ?)`, [name, type, desc]);
      });
      entityCount = embeddedEntities.length;
      
      embeddedRelations.forEach(([source, rel, target]) => {
        dbEons.run(`INSERT INTO relations (source, target, relation_type) VALUES (?, ?, ?)`, [source, target, rel]);
      });
      relationCount = embeddedRelations.length;
    }
  } catch (err) {
    console.error('❌ Error loading data:', err.message);
    // Use minimal fallback
    const embeddedEntities = [["CIWU_AI","system","universal_knowledge_engine"],["Vortex","unit","cell_regeneration"]];
    const embeddedRelations = [["CIWU_AI","powers","Vortex"]];
    embeddedEntities.forEach(([name, type, desc]) => {
      dbEons.run(`INSERT INTO entities (name, type, description) VALUES (?, ?, ?)`, [name, type, desc]);
    });
    embeddedRelations.forEach(([source, rel, target]) => {
      dbEons.run(`INSERT INTO relations (source, target, relation_type) VALUES (?, ?, ?)`, [source, target, rel]);
    });
    entityCount = 2;
    relationCount = 1;
  }

  const kCount = dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0;
  
  console.log(`✅ EONS: ${entityCount} entities, ${relationCount} relations`);
  console.log(`✅ CORTEX: ${kCount} knowledge facts`);
  console.log(`🚀 CIWU OMNI v2.0 LIVE!`);
})();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/stats', (req, res) => {
  if (!dbCortex || !dbEons) return res.json({ error: 'DB not ready' });
  const entities = dbEons.exec('SELECT COUNT(*) FROM entities')[0]?.values[0]?.[0] || 0;
  const relations = dbEons.exec('SELECT COUNT(*) FROM relations')[0]?.values[0]?.[0] || 0;
  const knowledge = dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0;
  res.json({ entities, relations, knowledge, timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  
  const lowerMsg = message.toLowerCase();
  let response = "";

  if (lowerMsg.includes('stats') || lowerMsg.includes('count')) {
    const stats = {
      entities: dbEons.exec('SELECT COUNT(*) FROM entities')[0]?.values[0]?.[0] || 0,
      relations: dbEons.exec('SELECT COUNT(*) FROM relations')[0]?.values[0]?.[0] || 0,
      knowledge: dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0
    };
    response = `🧠 **KNOWLEDGE CORE STATUS** 🧠\n\n✅ Entities: ${stats.entities}\n✅ Relations: ${stats.relations}\n✅ Knowledge Facts: ${stats.knowledge}\n\n⚡ CIWU OMNI v2.0 ONLINE`;
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    response = "⚡ **CIWU OMNI v2.0 ONLINE** ⚡\n\nYour lineage is protected.";
  } else {
    response = "⚡ Processing...\n\nAvailable: stats, longevity, DNA, skin, escrow";
  }

  res.json({ response, timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🌐 CIWU OMNI v2.0 Server running on port ${PORT}`);
});
