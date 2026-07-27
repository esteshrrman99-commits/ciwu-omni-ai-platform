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

// BATCH ARRAYS - DATA WILL BE APPENDED HERE
let batchKnowledge = [];
let batchEntities = [];
let batchRelations = [];

// Initialize Databases
(async () => {
  const SQL = await initSqlJs();
  
  dbCortex = new SQL.Database();
  dbEons = new SQL.Database();
  
  // Create tables
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
  
  // Load all batches
  console.log(`🔄 Loading Knowledge Batches...`);
  batchKnowledge.forEach(([entity, relation, value]) => {
    dbCortex.run(`INSERT INTO knowledge (entity, relation, value) VALUES (?, ?, ?)`, [entity, relation, value]);
  });
  
  console.log(`🔄 Loading Entity Batches...`);
  batchEntities.forEach(([name, type, desc]) => {
    dbEons.run(`INSERT INTO entities (name, type, description) VALUES (?, ?, ?)`, [name, type, desc]);
  });
  
  console.log(`🔄 Loading Relation Batches...`);
  batchRelations.forEach(([source, rel, target]) => {
    dbEons.run(`INSERT INTO relations (source, target, relation_type) VALUES (?, ?, ?)`, [source, target, rel]);
  });
  
  const eCount = dbEons.exec('SELECT COUNT(*) FROM entities')[0]?.values[0]?.[0] || 0;
  const rCount = dbEons.exec('SELECT COUNT(*) FROM relations')[0]?.values[0]?.[0] || 0;
  const kCount = dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0;
  
  console.log(`✅ EONS: ${eCount} entities, ${rCount} relations`);
  console.log(`✅ CORTEX: ${kCount} knowledge facts`);
  console.log(`🚀 CIWU OMNI v2.0 LIVE!`);
})();

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Stats API
app.get('/api/stats', (req, res) => {
  if (!dbCortex || !dbEons) return res.json({ error: 'DB not ready' });
  const entities = dbEons.exec('SELECT COUNT(*) FROM entities')[0]?.values[0]?.[0] || 0;
  const relations = dbEons.exec('SELECT COUNT(*) FROM relations')[0]?.values[0]?.[0] || 0;
  const knowledge = dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0;
  res.json({ entities, relations, knowledge, timestamp: new Date().toISOString() });
});

// Chat API (Same logic as before)
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  const lowerMsg = message.toLowerCase();
  let response = "Processing through CIWU OMNI neural core...";
  
  if (lowerMsg.includes('mother') || lowerMsg.includes('wife') || lowerMsg.includes('longevity')) {
    response = `🧬 **LONGEVITY SUPPLEMENT FORMULA DETECTED** 🧬\n\nTarget: Mother/Wife Profile\nGoal: Cellular Regeneration\n\nImmediate Action (0-30 Days):\n• CoQ10 (100mg)\n• NMN (500mg)\n• Vitamin D3 (5000IU)\n• Omega-3 (2000mg)\n\nTotal Monthly Cost: $97.50\nNext Step: Upload blood panel for DNA optimization.`;
  } else if (lowerMsg.includes('stats')) {
    const stats = {
      entities: dbEons.exec('SELECT COUNT(*) FROM entities')[0]?.values[0]?.[0] || 0,
      relations: dbEons.exec('SELECT COUNT(*) FROM relations')[0]?.values[0]?.[0] || 0,
      knowledge: dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0
    };
    response = `🧠 **KNOWLEDGE CORE STATUS** 🧠\n\nEntities: ${stats.entities}\nRelations: ${stats.relations}\nKnowledge: ${stats.knowledge}`;
  } else if (lowerMsg.includes('hello')) {
    response = "⚡ CIWU OMNI v2.0 ONLINE ⚡\nYour lineage is protected.\nCommands: 'Analyze mother longevity', 'Upload DNA', 'Skin treatment', 'Set up escrow'.";
  } else {
    response = "⚡ Processing... Available: Medical Upload, DNA Analysis, Skin Diagnosis, Escrow Setup, ZORTEX Therapy.";
  }
  res.json({ response, timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 CIWU OMNI v2.0 Server running on port ${PORT}`);
});

// --- BATCH 1: MEDICAL & BIOTECH ---
batchEntities.push([
  ["Stem_Cell_Therapy","technology","regenerative_medicine_core"],["CRISPR_Gene_Edition","technology","precise_dna_manipulation"],["Telomere_Extension","therapy","chromosome_lengthening"],["Senolytics","drug_class","aged_cell_clearance"],["NAD_Boosters","supplement","metabolic_activation"],["Mitochondrial_Therapy","treatment","cellular_energy_repair"],["Epigenetic_Reprogramming","therapy","age_reset_protocol"],["Organ_3D_Printing","manufacturing","biofabricated_organs"],["Synthetic_Organoid","research","miniature_organs"],["Gene_Silencing_RNA","treatment","protein_production_block"],["Protein_Therapy","medicine","enzymatic_replacement"],["Peptide_Signaling","therapy","cell_communication_modulation"],["Hormone_Optimization","treatment","endocrine_balance"],["Immune_Reprogramming","therapy","autoimmune_correction"],["Microbiome_Engineering","treatment","gut_flora_optimization"],["Nutrigenomics","science","diet_gene_interaction"],["Metabolic_Flexibility","state","energy_source_adaptation"],["Autophagy_Enhancement","process","cellular_cleaning"],["Heat_Shock_Proteins","therapy","stress_response_boost"],["Sirtuin_Activation","pathway","longevity_enzyme_activation"],
  ["AI_Drug_Discovery","technology","machine_learning_pharma"],["Quantum_Simulation_Bio","simulation","molecular_modeling"],["Bioprinting_Tissue","manufacturing","layered_cell_structure"],["Vaccine_mRNA","therapy","genetic_instruction_delivery"],["CAR-T_Therapy","immunotherapy","engineered_t_cell_attack"],["Gene_Therapy_Vector","delivery","viral_non-viral_transport"],["Base_Editing","technique","single_nucleotide_change"],["Prime_Editing","technique","search_and_replace_DNA"],["Epigenome_Editor","tool","methylation_modification"],["Chromatin_Remodeler","complex","DNA_access_control"],["Single_Cell_Seq","analysis","individual_cell_genome"],["Spatial_Transcriptomics","mapping","tissue_location_gene_expr"],["Organ_on_Chip","device","microfluidic_physiology"],["3D_Bioprinter","hardware","cell_deposition_machine"],["Bioink","material","living_cell_scaffold"]
].flat());

batchRelations.push([
  ["Stem_Cell_Therapy","treats","Parkinson's_disease"],["Stem_Cell_Therapy","treats","Spinal_cord_injury"],["CRISPR_Gene_Edition","corrects","Sickle_cell_disease"],["Telomere_Extension","extends","Cellular_lifespan"],["Senolytics","clears","Senescent_cells"],["NAD_Boosters","increases","Cellular_energy"],["Mitochondrial_Therapy","enhances","ATP_production"],["Epigenetic_Reprogramming","resets","Cellular_age"],["Organ_3D_Printing","creates","Patient_specific_tissues"],["Synthetic_Organoid","models","Disease_progression"],["Gene_Silencing_RNA","blocks","Huntingtin_protein"],["Protein_Therapy","replaces","Deficient_enzymes"],["Peptide_Signaling","modulates","Cell_receptors"],["Hormone_Optimization","balances","Endocrine_system"],["Immune_Reprogramming","fixes","Autoimmune_errors"],["Microbiome_Engineering","optimizes","Gut_flora"],["Nutrigenomics","matches","Genetic_dietary_needs"],["Metabolic_Flexibility","allows","Fuel_switching"],["Autophagy_Enhancement","cleans","Damaged_organelles"],["Heat_Shock_Proteins","protects","Protein_folding"],["Sirtuin_Activation","activates","Longevity_pathways"],["AI_Drug_Discovery","accelerates","Drug_candidate_selection"],["Quantum_Simulation_Bio","models","Protein_folding_dynamics"],["Bioprinting_Tissue","constructs","Vascularized_structures"],["Vaccine_mRNA","instructs","Antigen_production"],["CAR-T_Therapy","kills","Cancer_cells"],["Gene_Therapy_Vector","carries","Therapeutic_genes"],["Base_Editing","changes","Single_bases"],["Prime_Editing","rewrites","DNA_sequences"],["Epigenome_Editor","modifies","Histone_marks"],["Chromatin_Remodeler","opens","Tightly_wrapped_DNA"],["Single_Cell_Seq","profiles","Cellular_heterogeneity"],["Spatial_Transcriptomics","maps","Gene_expression_locations"],["Organ_on_Chip","simulates","Human_organ_functions"],["3D_Bioprinter","prints","Living_tissues"],["Bioink","supports","Cell_survival"]
].flat());

// --- BATCH 2: AI & COMPUTATIONAL ---
batchEntities.push([
  ["CIWU_Neural_Network","ai_system","family_protection_engine"],["Knowledge_Graph","database","connected_information"],["Machine_Learning_Model","algorithm","pattern_recognition"],["Natural_Language_Processing","technology","text_understanding"],["Computer_Vision","ai_capability","visual_interpretation"],["Predictive_Analytics","analysis","future_outcome_forecasting"],["Anomaly_Detection","security","irregularity_identification"],["Automated_Decision_System","ai","rule_based_choices"],["Expert_System","ai","domain_knowledge_replication"],["Reinforcement_Learning","ml_method","trial_error_optimization"],["Deep_Learning_Network","ai_architecture","multi_layer_processing"],["Transfer_Learning","technique","knowledge_reuse"],["Federated_Learning","privacy","distributed_training"],["Quantum_Machine_Learning","frontier","quantum_ai_hybrid"],["Explainable_AI","transparency","decision_interpretability"],["Generative_Adversarial_Network","model","synthetic_data_creation"],["Transformer_Architecture","model","attention_mechanism_nlp"],["Convolutional_Neural_Net","model","image_recognition_system"],["Recurrent_Neural_Net","model","sequential_data_processing"],["Long_Short_Term_Memory","network","memory_retention_unit"],["Graph_Neural_Network","model","relational_data_processing"],["Variational_Autoencoder","model","latent_space_generation"],["Diffusion_Model","model","iterative_image_synthesis"],["Large_Language_Model","model","text_generation_engine"],["Multimodal_AI","system","text_image_audio_integration"],["Edge_Computing","infrastructure","local_data_processing"],["Cloud_Computing","infrastructure","remote_server_farms"],["Quantum_Computing","infrastructure","qubit_based_calculation"],["Neuromorphic_Hardware","chip","brain_like_architecture"],["Optical_Computing","technology","photon_based_logic"]
].flat());

batchRelations.push([
  ["CIWU_Neural_Network","analyzes","Medical_records"],["CIWU_Neural_Network","generates","Personalized_protocols"],["Knowledge_Graph","connects","Scientific_findings"],["Machine_Learning_Model","optimizes","Treatment_dosing"],["Natural_Language_Processing","understands","Patient_queries"],["Computer_Vision","diagnoses","Medical_images"],["Predictive_Analytics","forecasts","Disease_onset"],["Anomaly_Detection","flags","Abnormal_values"],["Automated_Decision_System","guides","Clinical_choices"],["Expert_System","replicates","Doctor_knowledge"],["Reinforcement_Learning","learns","Optimal_strategies"],["Deep_Learning_Network","recognizes","Complex_patterns"],["Transfer_Learning","applies","Pre-trained_weights"],["Federated_Learning","trains","Private_data_sets"],["Quantum_Machine_Learning","speeds_up","Optimization_problems"],["Explainable_AI","explains","Black_box_decisions"],["Generative_Adversarial_Network","creates","Fake_medical_records"],["Transformer_Architecture","powers","Modern_language_models"],["Convolutional_Neural_Net","detects","Tumors_in_scans"],["Recurrent_Neural_Net","predicts","Time_series_data"],["Long_Short_Term_Memory","remembers","Long_term_context"],["Graph_Neural_Network","models","Molecular_structures"],["Variational_Autoencoder","compresses","High_dim_data"],["Diffusion_Model","generates","High_quality_images"],["Large_Language_Model","answers","Medical_questions"],["Multimodal_AI","interprets","Mixed_media_inputs"],["Edge_Computing","reduces","Latency_issues"],["Cloud_Computing","scales","Compute_resources"],["Quantum_Computing","solves","Intractable_problems"],["Neuromorphic_Hardware","mimics","Neural_spikes"],["Optical_Computing","transmits","Light_speed_data"]
].flat());

// --- BATCH 3: LONGEVITY & LIFESTYLE ---
batchEntities.push([
  ["Hayflick_Limit","concept","cell_division_maximum"],["Telomere_Length","marker","biological_age_indicator"],["Senescent_Cell","phenotype","zombie_cell_accumulation_inflammation"],["Inflammaging","process","chronic_low_grade_inflammation"],["Geroscience","field","aging_as_root_cause"],["Healthspan","goal","healthy_years_maximization"],["Compression_of_Morbidity","theory","illness_period_reduction"],["Blue_Zones","geography","longevity_hotspots"],["Centenarian","population","100_plus_years_lived"],["Superager","subset","exceptional_cognitive_retention"],["Longevity_Dispensary","facility","anti-aging_treatment_center"],["Wellness_Tourism","industry","health_travel"],["Biohacking","practice","self_experimentation"],["Graying_of_America","demographic","aging_population_trend"],["Demographic_Transition","trend","birth_death_rate_shift"],["Intermittent_Fasting","diet","eating_window_restriction"],["Ketogenic_Diet","diet","high_fat_low_carb"],["Mediterranean_Diet","diet","olive_oil_fruit_vegetable"],["Plant_Based_Diet","diet","vegetable_centric_consumption"],["Paleo_Diet","diet","hunter_gatherer_replica"],["Time_Restricted_Eating","schedule","daily_meal_timing"],["Caloric_Restriction","diet","reduced_calorie_intake"],["Protein_Cycling","method","variable_intake_schedule"],["Carb_Cycling","technique","glycogen_refill_timing"],["Micronutrient_Optimization","goal","vitamin_mineral_balance"],["Sleep_Optimization","habit","rest_quality_maximization"],["Circadian_Rhythm","cycle","24_hour_body_clock"],["Morning_Sunlight","exposure","vitamin_D_synthesis_trigger"],["Evening_Wind_Down","ritual","bedtime_preparation"],["Screen_Time_Limit","restriction","blue_light_reduction"]
].flat());

batchRelations.push([
  ["Hayflick_Limit","limits","Cellular_replication"],["Telomere_Length","indicates","Biological_age"],["Senescent_Cell","causes","Inflammaging"],["Inflammaging","drives","Chronic_disease"],["Geroscience","targets","Aging_processes"],["Healthspan","extends","Years_of_vitality"],["Compression_of_Morbidity","shortens","Period_of_illness"],["Blue_Zones","showcases","Long_living_communities"],["Centenarian","exemplifies","Extreme_longevity"],["Superager","demonstrates","Cognitive_resilience"],["Longevity_Dispensary","offers","Anti-aging_treatments"],["Wellness_Tourism","promotes","Health_travel_experiences"],["Biohacking","encourages","Self_optimization"],["Graying_of_America","reflects","Population_aging"],["Demographic_Transition","shows","Birth_death_rate_shifts"],["Intermittent_Fasting","triggers","Autophagy"],["Ketogenic_Diet","induces","Ketosis_state"],["Mediterranean_Diet","lowers","Cardiovascular_risk"],["Plant_Based_Diet","reduces","Cancer_incidence"],["Paleo_Diet","mimics","Ancestral_eating"],["Time_Restricted_Eating","aligns_with","Circadian_rhythms"],["Caloric_Restriction","extends","Lifespan_in_models"],["Protein_Cycling","maintains","Muscle_mass"],["Carb_Cycling","optimizes","Performance_recovery"],["Micronutrient_Optimization","fills","Nutritional_gaps"],["Sleep_Optimization","enhances","Cognitive_performance"],["Circadian_Rhythm","governs","Body_functions"],["Morning_Sunlight","sets","Internal_clock"],["Evening_Wind_Down","prepares","For_sleep"],["Screen_Time_Limit","protects","Melatonin_production"]
].flat());

// --- BATCH 4: FAMILY HEALTH & ZORTEX ---
batchEntities.push([
  ["Mother_Profile","patient","primary_family_member"],["Wife_Profile","patient","secondary_family_member"],["Children_Profile","patients","generational_protection"],["Father_Profile","patient","elder_care_target"],["Extended_Family","members","kinship_network"],["Genetic_Predisposition","risk","hereditary_conditions"],["Family_History","record","medical_lineage_data"],["Heritable_Trait","characteristic","passed_down_features"],["Polygenic_Risk_Score","metric","multiple_gene_vulnerability"],["Pharmacogenomics","field","drug_response_genetics"],["Carrier_Status","condition","recessive_gene_holder"],["De_Novo_Mutation","event","spontaneous_gene_change"],["Mosaicism","state","mixed_cell_genetics"],["Epigenetic_Inheritance","mechanism","non-DNA_transmission"],["Transgenerational_Effect","phenomenon","ancestor_impact_descendant"],["Zortex_Matrix","technology","advanced_cellular_architecture"],["Neurotex_Core","system","neural_connectivity_optimization"],["Vortex_Engine","unit","core_cell_regeneration"],["Lortex_Structure","framework","brain_tissue_connection"],["Irotex_Interface","gateway","tissue_repair_portal"],["Celltex_Module","compartment","stem_cell_storage"],["Hertex_Unit","module","cardiovascular_support"],["Eontex_System","platform","temporal_growth_management"],["Aurtex_Network","grid","ear_healing_array"],["Surtex_Layer","membrane","surface_protection_barrier"],["Cyborg_Integration","fusion","human_machine_merge"],["Bionic_Enhancement","upgrade","artificial_part_implant"],["Neural_lace","interface","brain_network_connection"],["Synthetic_Organ","replacement","man-made_body_part"],["Augmented_Reality_Medical","visualization","overlay_diagnostic_tool"]
].flat());

batchRelations.push([
  ["Mother_Profile","needs","Zortex_Matrix"],["Wife_Profile","needs","Neurotex_Core"],["Children_Profile","protected_by","Vortex_Engine"],["Father_Profile","treated_by","Cortex_Knowledge"],["Genetic_Predisposition","increases","Disease_risk"],["Family_History","informs","Preventive_care"],["Heritable_Trait","passed_from","Parent_to_child"],["Polygenic_Risk_Score","quantifies","Genetic_likelihood"],["Pharmacogenomics","tailors","Medication_dosing"],["Carrier_Status","implies","Risk_to_offspring"],["De_Novo_Mutation","arises","Spontaneously"],["Mosaicism","results_from","Post-zygotic_change"],["Epigenetic_Inheritance","transmits","Environmental_effects"],["Transgenerational_Effect","impacts","Future_generations"],["Zortex_Matrix","architects","Cellular_structure"],["Neurotex_Core","optimizes","Neural_paths"],["Vortex_Engine","regenerates","Cells"],["Lortex_Structure","connects","Brain_tissue"],["Irotex_Interface","repairs","Damaged_tissue"],["Celltex_Module","stores","Stem_cells"],["Hertex_Unit","supports","Heart_function"],["Eontex_System","manages","Temporal_growth"],["Aurtex_Network","heals","Ear_structures"],["Surtex_Layer","protects","Surface_layers"],["Cyborg_Integration","merges","Man_and_machine"],["Bionic_Enhancement","replaces","Lost_limbs"],["Neural_lace","links","Mind_to_cloud"],["Synthetic_Organ","replaces","Failed_organs"],["Augmented_Reality_Medical","visualizes","Internal_anatomy"]
].flat());

// --- BATCH 5: SUPPLEMENTS & DIAGNOSTICS ---
batchEntities.push([
  ["Resveratrol","compound","polyphenol_anti-aging"],["Curcumin","substance","turmeric_active_component"],["Quercetin","molecule","flavonoid_antioxidant"],["Berberine","alkaloid","metabolic_regulator"],["Alpha_Lipoic_Acid","acid","universal_antioxidant"],["Coenzyme_Q10","cofactor","electron_transport_helper"],["Nicotinamide_Riboside","vitamin","NAD_precursor"],["Pterostilbene","analogue","resveratrol_derivative"],["Fisetin","senolytic","aged_cell_clearance_agent"],["Apigenin","flavonoid","sleep_promoter"],["Luteolin","compound","inflammation_inhibitor"],["EGCG","catechin","green_tea_extraction"],["Gingerol","phenol","anti-nausea_agent"],["Capsaicin","alkaloid","pain_reliever_thermogenic"],["Melatonin","hormone","sleep_cycle_regulator"],["Full_Body_MRI","scan","complete_anatomical_imaging"],["CT_Scan","tomography","cross_sectional_xray"],["PET_Scan","positron_emission","metabolic_activity_map"],["DEXA_Scan","bone_density","osteoporosis_diagnosis"],["Carotid_Intima_Media_Thickness","measure","arterial_wall_assessment"],["Coronary_Calcium_Score","calcification","heart_attack_risk_index"],["Continuous_Glucose_Monitor","device","real-time_sugar_tracking"],["Heart_Rate_Variability","metric","autonomic_nervous_balance"],["VO2_Max_Test","fitness","maximal_oxygen_utilization"],["Resting_Heart_Rate","vital","baseline_cardiac_rate"],["Body_Composition_Analysis","assessment","fat_muscle_ratio"],["Thermography","thermal_imaging","inflammation_detection"],["Electrocardiogram","ECG","heart_electrical_activity"],["Electroencephalogram","EEG","brain_wave_recording"],["Functional_MRI","fMRI","neural_activity_mapping"]
].flat());

batchRelations.push([
  ["Resveratrol","activates","Sirtuins"],["Curcumin","reduces","Inflammation"],["Quercetin","scavenges","Free_radicals"],["Berberine","lowers","Blood_sugar"],["Alpha_Lipoic_Acid","recycles","Antioxidants"],["Coenzyme_Q10","powers","Mitochondria"],["Nicotinamide_Riboside","boosts","NAD_levels"],["Pterostilbene","mimics","Resveratrol_effects"],["Fisetin","kills","Senescent_cells"],["Apigenin","induces","Relaxation"],["Luteolin","blocks","Inflammatory_cytokines"],["EGCG","inhibits","Cancer_cell_growth"],["Gingerol","soothes","Digestive_tract"],["Capsaicin","stimulates","Pain_receptors"],["Melatonin","regulates","Sleep_wake_cycle"],["Full_Body_MRI","images","Entire_body"],["CT_Scan","visualizes","Internal_structures"],["PET_Scan","tracks","Metabolic_activity"],["DEXA_Scan","measures","Bone_density"],["Carotid_Intima_Media_Thickness","assesses","Stroke_risk"],["Coronary_Calcium_Score","predicts","Heart_attack_risk"],["Continuous_Glucose_Monitor","tracks","Glucose_levels"],["Heart_Rate_Variability","measures","Stress_recovery"],["VO2_Max_Test","determines","Aerobic_fitness"],["Resting_Heart_Rate","indicates","Cardiovascular_health"],["Body_Composition_Analysis","calculates","Fat_percentage"],["Thermography","detects","Heat_patterns"],["Electrocardiogram","records","Heart_rhythm"],["Electroencephalogram","monitors","Brain_activity"],["Functional_MRI","maps","Brain_regions"]
].flat());

// Finalize Knowledge Batches (Adding the 150 facts)
batchKnowledge.push([
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
].flat());
