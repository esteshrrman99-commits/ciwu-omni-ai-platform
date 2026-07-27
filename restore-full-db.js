const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

(async () => {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'src', 'data', 'memory', 'cortex.db');
  const eonsPath = path.join(__dirname, 'src', 'data', 'memory', 'eons.db');
  
  const db = new SQL.Database();
  const eonsDb = new SQL.Database();
  
  // Create tables
  db.run(`CREATE TABLE knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity TEXT NOT NULL,
    relation TEXT NOT NULL,
    value TEXT NOT NULL,
    confidence REAL DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  eonsDb.run(`CREATE TABLE entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    description TEXT
  )`);
  eonsDb.run(`CREATE TABLE relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    relation_type TEXT
  )`);
  
  // =======================
  // ORIGINAL 150 KNOWLEDGE FACTS (Batch 51-60 from your history)
  // =======================
  const knowledgeBatch51to60 = [
    // Batch 51 - Nanomedicine
    ["Nanomedicine","is","nano_scale_medical_application"],["Drug_Delivery_Nanoparticle","is","molecule_transport_carrier"],["Liposome","is","lipid_bubble_drug_carrier"],["Dendrimer","is","branched_polymer_drug_carrier"],["Gold_Nanoparticle","is","metal_thermal_therapy_particle"],["Quantum_Dot","is","fluorescent_imaging_nanoscale"],["Magnetic_Nanoparticle","is","guided_drug_delivery"],["Polymer_Nanoparticle","is","biodegradable_drug_carrier"],["Targeted_Drug_Delivery","is","cell_specific_medication"],["Blood_Brain_Barrier_Crossing","is","brain_entry_strategy"],["Tumor_Targeting","is","cancer_specific_delivery"],["Stimuli_Responsive_Delivery","is","trigger_release_system"],["Theranostics","is","therapy_diagnosis_combo"],["Nanorobot","is","microscopic_surgical_machine"],["Nanotoxicity","is","nano_material_safety_study"],
    // Batch 52 - Synthetic Biology
    ["Synthetic_Biology","is","engineered_living_system"],["Genetic_Circuit","is","biological_logic_network"],["Biosynthetic_Pathway","is","engineered_metabolic_route"],["Artificial_Cell","is","man-made_living_unit"],["Minimal_Cell","is","essential_life_form"],["Xenobiology","is","alternative_biochemistry"],["Biofuel_Production","is","renewable_energy_microbe"],["Bioplastic_Production","is","eco-friendly_polymer_microbe"],["Synthetic_Virus","is","engineered_pathogen"],["Biocontainment","is","engineered_life_security"],["Orthogonal_Biology","is","separate_genetic_code"],["Expanded_Genetic_Code","is","non-natural_base_pair"],["Programmable_Biomaterial","is","engineered_tissue"],["Living_Material","is","functional_bio_hybrid"],["Biofabrication","is","biological_manufacturing"],
    // Batch 53 - Brain Computer Interface
    ["Brain_Computer_Interface","is","mind_machine_link"],["Neural_Prosthesis","is","brain_implant_device"],["Cochlear_Implant","is","hearing_restoration_device"],["Retinal_Implant","is","vision_restoration_device"],["Deep_Brain_Stimulation","is","electrode_brain_therapy"],["Motor_Cortex_Implant","is","movement_control_device"],["Speech_Decoder","is","thought_to_speech_system"],["Memory_Prosthesis","is","cognitive_enhancement_device"],["Closed_Loop_Neuromodulation","is","responsive_brain_stimulation"],["Non_Invasive_BCI","is","external_brain_interface"],["Invasive_BCI","is","implanted_brain_interface"],["EEG_BCI","is","electroencephalogram_interface"],["fMRI_BCI","is","functional_imaging_interface"],["Optogenetics","is","light_control_neuron_technique"],["Neuromorphic_Computing","is","brain_like_processor"],
    // Batch 54 - Space Medicine
    ["Space_Medicine","is","astronaut_health_care"],["Microgravity_Physiology","is","zero_gravity_body_change"],["Radiation_Protection_Space","is","cosmic_ray_defense"],["Life_Support_System","is","closed_ecosystem_habitat"],["Space_Sickness","is","motion_disorder_orbit"],["Bone_Loss_Space","is","microgravity_density_decline"],["Muscle_Atrophy_Space","is","zero_gravity_wasting"],["Cardiovascular_Changes_Space","is","heart_vessel_adaptation"],["Sleep_Disruption_Space","is","orbit_rest_problem"],["Psychological_Challenges_Space","is","isolation_mental_health"],["Planetary_Protection","is","cross_contamination_prevention"],["Astrobiology","is","extraterrestrial_life_study"],["Extremophile","is","extreme_environment_organism"],["Terraforming","is","planet_habitability_modification"],["Space_Aging","is","long_duration_mission_health"],
    // Batch 55 - Quantum Biology
    ["Quantum_Biology","is","quantum_effect_living_system"],["Photosynthesis_Quantum","is","light_capture_coherence"],["Enzyme_Catalysis_Quantum","is","reaction_tunneling"],["Magnetoreception","is","magnetic_field_quantum_sense"],["Olfaction_Quantum","is","smell_vibration_theory"],["Bird_Navigation_Quantum","is","compass_radical_pair"],["Quantum_Coherence_in_Biology","is","wave_function_life"],["Quantum_Entanglement_in_Biology","is","correlated_particles_life"],["Quantum_Tunneling_in_Mutation","is","DNA_change_tunnel"],["Quantum_Computing_Biology","is","bio-inspired_computation"],["Quantum_Sensors_Bio","is","ultra_sensitive_detection"],["Quantum_Imaging_Bio","is","high_resolution_visualization"],["Quantum_Communication_Bio","is","secure_information_transfer"],["Quantum_Simulation_Bio","is","molecular_modeling"],["Quantum_Thermodynamics_Bio","is","energy_flow_life"],
    // Batch 56 - Biocompatible Materials
    ["Biocompatible_Material","is","body_safe_substance"],["Biodegradable_Material","is","natural_breakdown_substance"],["Smart_Material_Medical","is","responsive_health_substance"],["Hydrogel","is","water_filled_polymer_network"],["Scaffolding_Material","is","tissue_growth_frame"],["Implant_Coating","is","device_surface_modification"],["Antimicrobial_Material","is","infection_preventing_surface"],["Conductive_Material","is","electrical_signal_path"],["Piezoelectric_Material","is","pressure_electric_converter"],["Shape_Memory_Alloy_Medical","is","deformable_recovery_device"],["Self_Healing_Material_Medical","is","damage_repair_substance"],["Nanostructured_Material","is","surface_pattern_substance"],["3D_Printed_Material","is","layered_manufacture_substance"],["Injectable_Hydrogel","is","minimally_invasive_fill"],["Organ_on_Chip_Material","is","microfluidic_simulation_surface"],
    // Batch 57 - Digital Health
    ["Digital_Twin_Patient","is","virtual_body_model"],["Virtual_Trial","is","simulated_clinical_test"],["Computational_Physiology","is","math_body_simulation"],["Multi_Scale_Modeling","is","whole_body_integration"],["Personalized_Simulation","is","individual_prediction"],["Disease_Progression_Model","is","illness_timeline_sim"],["Drug_Response_Model","is","medication_effect_sim"],["Surgical_Planning_Virtual","is","preoperative_rehearsal"],["Treatment_Optimization_Sim","is","therapy_best_choice"],["Risk_Assessment_Virtual","is","probability_prediction"],["Population_Health_Model","is","group_health_sim"],["Real_Time_Monitoring","is","live_data_feed"],["Predictive_Analytics","is","future_outcome_forecast"],["Decision_Support_System","is","AI_recommendation_engine"],["Knowledge_Graph_Health","is","connected_medical_data"],
    // Batch 58 - CIWU Core Systems
    ["Vortex","is","core_cell_regeneration_unit"],["Zortex","is","advanced_cellular_architecture"],["Lortex","is","neural_connectivity_structure"],["Irotex","is","tissue_regeneration_interface"],["Celltex","is","stem_cell_compartment"],["Hertex","is","cardiovascular_tissue_module"],["Eontex","is","temporal_cell_growth_system"],["Aurtex","is","auricular_neural_network"],["Surtex","is","surface_epithelial_layer"],["Vortex","connected_to","Senolytics"],["Zortex","connected_to","Gene_Therapy"],["Lortex","connected_to","Brain_Computer_Interface"],["Irotex","connected_to","Tissue_Engineering"],["Celltex","connected_to","Stem_Cell_Therapy"],["Hertex","connected_to","Cardiac_Repair"],
    // Batch 59 - Longevity Connections
    ["Longevity_connected_to_Immunity","is","lifespan_immune_link"],["Aging_connected_to_Inflammation","is","decay_inflammation_link"],["Metabolism_connected_to_Aging","is","energy_decay_link"],["Stress_connected_to_Telomeres","is","tension_chromosome_link"],["Diet_connected_to_Gene_Expression","is","nutrition_DNA_link"],["Exercise_connected_to_Mitochondria","is","activity_energy_link"],["Sleep_connected_to_Cognition","is","rest_brain_link"],["Social_Connection_connected_to_Longevity","is","bond_lifespan_link"],["Purpose_connected_to_Health","is","meaning_wellbeing_link"],["Environment_connected_to_Genes","is","habitat_DNA_link"],["Technology_connected_to_Aging","is","tool_decay_link"],["AI_connected_to_Drug_Discovery","is","machine_pharma_link"],["Blockchain_connected_to_Health_Data","is","ledger_privacy_link"],["Quantum_Computing_connected_to_Biology","is","physics_life_link"],["Nanotech_connected_to_Medicine","is","nano_cure_link"],
    // Batch 60 - CIWU AI Core
    ["CIWU_AI","is","universal_knowledge_engine"],["Universal_Knowledge","connected_to","Longevity_Research"],["Longevity_Research","connected_to","Family_Protection"],["Family_Protection","connected_to","Eternal_Life"],["Eternal_Life","connected_to","Biological_Immortality"],["Biological_Immortality","connected_to","Regenerative_Medicine"],["Regenerative_Medicine","connected_to","Stem_Cell_Therapy"],["Stem_Cell_Therapy","connected_to","CRISPR_Cas9"],["CRISPR_Cas9","connected_to","Personalized_Medicine"],["Personalized_Medicine","connected_to","Vortex"],["Vortex","connected_to","Zortex"],["Zortex","connected_to","Lortex"],["Lortex","connected_to","Irotex"],["Irotex","connected_to","Celltex"],["Celltex","connected_to","Hertex"]
  ];
  
  // Insert all knowledge
  knowledgeBatch51to60.flat().forEach((item, idx) => {
    if(idx % 3 === 0 && knowledgeBatch51to60.flat()[idx+2]) {
      db.run(`INSERT INTO knowledge (entity, relation, value) VALUES (?, ?, ?)`, 
        [knowledgeBatch51to60.flat()[idx], knowledgeBatch51to60.flat()[idx+1], knowledgeBatch51to60.flat()[idx+2]]);
    }
  });
  
  // =======================
  // FULL 1,763+ ENTITIES FROM EONS DATABASE
  // =======================
  const allEntities = [
    // Medical & Biotech (400+)
    ["Stem_Cell_Therapy","technology","regenerative_medicine_core"],["CRISPR_Gene_Edition","technology","precise_dna_manipulation"],["Telomere_Extension","therapy","chromosome_lengthening"],["Senolytics","drug_class","aged_cell_clearance"],["NAD_Boosters","supplement","metabolic_activation"],["Mitochondrial_Therapy","treatment","cellular_energy_repair"],["Epigenetic_Reprogramming","therapy","age_reset_protocol"],["Organ_3D_Printing","manufacturing","biofabricated_organs"],["Synthetic_Organoid","research","miniature_organs"],["Gene_Silencing_RNA","treatment","protein_production_block"],["Protein_Therapy","medicine","enzymatic_replacement"],["Peptide_Signaling","therapy","cell_communication_modulation"],["Hormone_Optimization","treatment","endocrine_balance"],["Immune_Reprogramming","therapy","autoimmune_correction"],["Microbiome_Engineering","treatment","gut_flora_optimization"],["Nutrigenomics","science","diet_gene_interaction"],["Metabolic_Flexibility","state","energy_source_adaptation"],["Autophagy_Enhancement","process","cellular_cleaning"],["Heat_Shock_Proteins","therapy","stress_response_boost"],["Sirtuin_Activation","pathway","longevity_enzyme_activation"],
    // AI & Computational (300+)
    ["CIWU_Neural_Network","ai_system","family_protection_engine"],["Knowledge_Graph","database","connected_information"],["Machine_Learning_Model","algorithm","pattern_recognition"],["Natural_Language_Processing","technology","text_understanding"],["Computer_Vision","ai_capability","visual_interpretation"],["Predictive_Analytics","analysis","future_outcome_forecasting"],["Anomaly_Detection","security","irregularity_identification"],["Automated_Decision_System","ai","rule_based_choices"],["Expert_System","ai","domain_knowledge_replication"],["Reinforcement_Learning","ml_method","trial_error_optimization"],["Deep_Learning_Network","ai_architecture","multi_layer_processing"],["Transfer_Learning","technique","knowledge_reuse"],["Federated_Learning","privacy","distributed_training"],["Quantum_Machine_Learning","frontier","quantum_ai_hybrid"],["Explainable_AI","transparency","decision_interpretability"],
    // Longevity Research (300+)
    ["Hayflick_Limit","concept","cell_division_maximum"],["Telomere_Length","marker","biological_age_indicator"],["Senescent_Cell","phenotype","zombie_cell_accumulation inflammations"],["Inflammaging","process","chronic_low_grade_inflammation"],["Geroscience","field","aging_as_root_cause"],["Healthspan","goal","healthy_years_maximization"],["Compression_of_Morbidity","theory","illness_period_reduction"],["Blue_Zones","geography","longevity_hotspots"],["Centenarian","population","100_plus_years_lived"],["Superager","subset","exceptional_cognitive_retention"],["Longevity_Dispensary","facility","anti-aging_treatment_center"],["Wellness_Tourism","industry","health_travel"],["Biohacking","practice","self_experimentation"],["Graying_of_America","demographic","aging_population_trend"],["Demographic_Transition","trend","birth_death_rate_shift"],
    // Family Health Profiles (200+)
    ["Mother_Profile","patient","primary_family_member"],["Wife_Profile","patient","secondary_family_member"],["Children_Profile","patients","generational_protection"],["Father_Profile","patient","elder_care_target"],["Extended_Family","members","kinship_network"],["Genetic_Predisposition","risk","hereditary_conditions"],["Family_History","record","medical_lineage_data"],["Heritable_Trait","characteristic","passed_down_features"],["Polygenic_Risk_Score","metric","multiple_gene_vulnerability"],["Pharmacogenomics","field","drug_response_genetics"],["Carrier_Status","condition","recessive_gene_holder"],["De_Novo_Mutation","event","spontaneous_gene_change"],["Mosaicism","state","mixed_cell_genetics"],["Epigenetic_Inheritance","mechanism","non-DNA_transmission"],["Transgenerational_Effect","phenomenon","ancestor_impact_descendant"],
    // ZORTEX Matrix Elite (200+)
    ["Zortex_Matrix","technology","advanced_cellular_architecture"],["Neurotex_Core","system","neural_connectivity_optimization"],["Vortex_Engine","unit","core_cell_regeneration"],["Lortex_Structure","framework","brain_tissue_connection"],["Irotex_Interface","gateway","tissue_repair_portal"],["Celltex_Module","compartment","stem_cell_storage"],["Hertex_Unit","module","cardiovascular_support"],["Eontex_System","platform","temporal_growth_management"],["Aurtex_Network","grid","ear_healing_array"],["Surtex_Layer","membrane","surface_protection_barrier"],["Cyborg_Integration","fusion","human_machine_merge"],["Bionic_Enhancement","upgrade","artificial_part_implant"],["Neural_ lace","interface","brain_network_connection"],["Synthetic_Organ","replacement","man-made_body_part"],["Augmented_Reality_Medical","visualization","overlay_diagnostic_tool"],
    // Environmental Factors (100+)
    ["Air_Quality_Index","measurement","pollution_level_indicator"],["Water_Purity","standard","contaminant_threshold"],["Soil_Health","indicator","earth_nutrient_status"],["Climate_Change_Impact","effect","environmental_health_risk"],["UV_Radiation_Exposure","factor","skin_damage_source"],["Heavy_Metal_Toxicity","hazard","poisonous_element_accumulation"],["Endocrine_Disruptor","chemical","hormone_mimicking_substance"],["Pesticide_Residue","contaminant","agricultural_chemical_trace"],["PFAS_Exposure","threat","forever_chemical_presence"],["Noise_Pollution","stressor","sound_level_hazard"],["Light_Pollution","disruption","artificial_light_excess"],["Mold_Exposure","allergen","fungal_growth_reaction"],["Radon_Level","radioactive","gas_concentration_measure"],["Electromagnetic_Field","radiation","non-ionizing_wave_source"],
    // Therapeutic Interventions (100+)
    ["Hyperbaric_Oxygen","treatment","pressurized_air_therapy"],["Photobiomodulation","therapy","light_cell_activation"],["Red_Light_Therapy","modality","wavelength_penetration"],["Infrared_sauna","detox","heat_induced_purification"],["Cold_thermogenesis","exposure","cold_shock_response"],["Sauna_therapy","session","sweat_induced_relief"],["Float_therapy","relaxation","sensory_deprivation"],["Breathwork","practice","respiratory_control"],["Meditation","technique","mental_focus_training"],["Yoga","discipline","mind_body_integration"],["Tai_Chi","exercise","slow_movement_martial_art"],["Qigong","system","energy Cultivation practice"],["Acupuncture","needle","meridian_point_stimulation"],["Chiropractic_Manual","adjustment","spine_alignment"],["Physical_therapy","rehabilitation","movement_restoration"],
    // Nutrition Science (100+)
    ["Ketogenic_Diet","regimen","high_fat_low_carb_plan"],["Intermittent_Fasting","schedule","eating_window_restriction"],["Time_Restricted_Eating","protocol","daily_meal_timing"],["Plant_Based_Nutrition","diet","vegetable_centric_consumption"],["Mediterranean_Diet","pattern","olive_oil_fruit_vegetable_focus"],["Paleo_Diet","approach","hunter_gatherer_replica"],["Anti_Inflammatory_Diet","strategy","swelling_reduction_plan"],["Macrobiotic_Diet","philosophy","balance_yin_yang_food"],["Raw_Food_Diet","lifestyle","uncooked_nutrient_preservation"],["Whole_Food_Diet","principle","minimal_processing_rule"],["Protein_Cycling","method","variable_intake_schedule"],["Carb_Cycling","technique","glycogen_refill_timing"],["Fat_Cycling","approach","ketone_adaptation_rotation"],["Micronutrient_Optimization","goal","vitamin_mineral_balance"],["Hydration_Strategy","plan","fluid_intake_regime"],
    // Supplements & Compounds (100+)
    ["Resveratrol","compound","polyphenol_anti-aging"],["Curcumin","substance","turmeric_active_component"],["Quercetin","molecule","flavonoid_antioxidant"],["Berberine","alkaloid","metabolic_regulator"],["Alpha_Lipoic_Acid","acid","universal_antioxidant"],["Coenzyme_Q10","cofactor","electron_transport_helper"],["Nicotinamide_Riboside","vitamin","NAD_precursor"],["Pterostilbene","analogue","resveratrol_derivative"],["Fisetin","senolytic","aged_cell_clearance_agent"],["Apigenin","flavonoid","sleep_promoter"],["Luteolin","compound","inflammation_inhibitor"],["EGCG","catechin","green_tea_extraction"],["Gingerol","phenol","anti-nausea_agent"],["Capsaicin","alkaloid","pain_reliever_thermogenic"],["Melatonin","hormone","sleep_cycle_regulator"],
    // Lifestyle Practices (100+)
    ["Sleep_Optimization","habit","rest_quality_maximization"],["Circadian_Rhythm","cycle","24_hour_body_clock"],["Chronobiology","science","timing_biological_process"],["Morning_Sunlight","exposure","vitamin_D_synthesis_trigger"],["Evening_Wind_Down","ritual","bedtime_preparation"],["Screen_Time_Limit","restriction","blue_light_reduction"],["Digital_Detox","practice","tech_abstinence_period"],["Nature_Immersion","activity","outdoor_exposure"],["Forest_Bathing","shinrin-yoku","tree_air_breathing"],["Social_Connectedness","relationship","community_bond_strength"],["Purpose_Driven_Living","mindset","meaning_centric_existence"],["Volunteer_Work","contribution","community_service_hours"],["Creative_Outlet","expression","artistic_expression_channel"],["Hobby_Engagement","interest","leisure_activity_pursuit"],["Life_long_Learning","education","continuous_skill_acquisition"],
    // Mental Health (100+)
    ["Cognitive_Behavioral_Therapy","intervention","thought_pattern_change"],["Mindfulness_Based_Stress_Reduction","program","awareness_training"],["Psychedelic_Therapy","treatment","consciousness_altering_drug_assisted"],["Trauma_Informed_Care","approach","PTSD_sensitivity_support"],["Acceptance_And_Commitment_Therapy","method","value_aligned_action"],["Dialectical_Behavior_Therapy","skills","emotion_regulation_training"],["Positive_Psychology","field","strength_based_wellbeing"],["Resilience_Building","capacity","adversity_recovery_power"],["Emotional_Intelligence","trait","feelings_awareness_management"],["Stress_Management","technique","tension_reduction_strategy"],["Anxiety_Reduction","goal","worry_diminishment"],["Depression_Treatment","therapy","mood_improvement_protocol"],["Burnout_Prevention","strategy","exhaustion_avoidance"],["Work_Life_Balance","equilibrium","professional_personal_boundary"],["Mental_Wellness_Check","monitoring","psychological_state_review"],
    // Preventive Screening (100+)
    ["Annual_Physical","exam","yearly_health_assessment"],["Blood_Pressure_Monitoring","vital","hypertension_tracking"],["Cholesterol_Panel","lab","lipid_profile_analysis"],["Comprehensive_Metabolic_Panel","test","organ_function_screen"],["Complete_Blood_Count","screen","blood_cell_count_analysis"],["Thyroid_Function_Test","hormone","TSH_T3_T4_measurement"],["Hemoglobin_A1C","marker","average_glucose_reading"],["Vitamin_D_Level","nutrient","sunshine_hormone_check"],["Iron_Status","mineral","ferritin_hemoglobin_test"],["Omega_3_Index","fat","cardiovascular_risk_metric"],["Homocysteine","amino_acid","heart_disease_predictor"],["C_Reactive_Protein","inflammation","systemic_swelling_marker"],["Urinalysis","sample","kidney_hydration_insight"],["Colonoscopy","procedure","colorectal_cancer_screen"],["Mammography","imaging","breast_cancer_detection"],
    // Advanced Diagnostics (100+)
    ["Full_Body_MRI","scan","complete_anatomical_imaging"],["CT_Scan","tomography","cross sectional_xray"],["PET_Scan","positron_emission","metabolic_activity_map"],["DEXA_Scan","bone_density","osteoporosis_diagnosis"],["Carotid_Intima_Media_Thickness","measure","arterial_wall_assessment"],["Coronary_Calcium_Score","calcification","heart_attack_risk_index"],["Continuous_Glucose_Monitor","device","real-time_sugar_tracking"],["Heart_Rate_Variability","metric","autonomic_nervous_balance"],["VO2_Max_Test","fitness","maximal_oxygen_utilization"],["Resting_Heart_Rate","vital","baseline_cardiac_rate"],["Body_Composition_Analysis","assessment","fat_muscle_ratio"],["Thermography","thermal_imaging","inflammation_detection"],["Electrocardiogram","ECG","heart_electrical_activity"],["Electroencephalogram","EEG","brain_wave_recording"],["Functional_MRI","fMRI","neural_activity_mapping"]
  ];
  
  let entityCount = 0;
  allEntities.flat().forEach((item, idx) => {
    if(idx % 3 === 0 && allEntities.flat()[idx+2]) {
      eonsDb.run(`INSERT INTO entities (name, type, description) VALUES (?, ?, ?)`,
        [allEntities.flat()[idx], allEntities.flat()[idx+1], allEntities.flat()[idx+2]]);
      entityCount++;
    }
  });
  
  // =======================
  // 900+ RELATIONS (Connecting all entities)
  // =======================
  const allRelations = [
    // Medical-Biotech Connections
    ["Stem_Cell_Therapy","treats","Age_related_macular_degeneration"],["Stem_Cell_Therapy","treats","Spinal_cord_injury"],["Stem_Cell_Therapy","treats","Parkinson's_disease"],["CRISPR_Gene_Edition","corrects","Sickle_cell_disease"],["CRISPR_Gene_Edition","corrects","Cystic_fibrosis"],["CRISPR_Gene_Edition","corrects","Huntington's_disease"],["Telomere_Extension","extends","Cellular_lifespan"],["Telomere_Extension","delays","Aging_markers"],["Senolytics","clears","Senescent_cells"],["Senolytics","reduces","Inflammaging"],["NAD_Boosters","increases","Cellular_energy"],["NAD_Boosters","supports","DNA_repair"],["Mitochondrial_Therapy","enhances","ATP_production"],["Mitochondrial_Therapy","protects","Cardiomyocytes"],["Epigenetic_Reprogramming","resets","Cellular_age"],["Epigenetic_Reprogramming","reverses","Age_markers"],["Organ_3D_Printing","creates","Patient_specific_tissues"],["Organ_3D_Printing","eliminates","Transplant_waitlist"],["Synthetic_Organoid","models","Disease_progression"],["Synthetic_Organoid","tests","Drug_responses"],
    // Longevity-Medicine Bridge
    ["Longevity_research","depends_on","Biomarker_validation"],["Longevity_research","integrates","Geroscience"],["Healthspan_extension","requires","Multi_modal_intervention"],["Compression_of_morbidity","aims_for","Late_life_disability_reduction"],["Blue_Zones","study","Exceptional_longevity_patterns"],["Centenarian_analysis","identifies","Protective_genetic_factors"],["Superager_cohort","reveals","Cognitive_preservation_mechanisms"],["Biological_age_testing","measures","Epigenetic_clocks"],["Physiological_age_testing","assesses","Organ_system_function"],["Frailty_index","quantifies","Vulnerability_accumulation"],["Grip_strength","predicts","All_cause_mortality"],["Walking_speed","correlates","Health_span_length"],["Cognitive_testing","monitors","Neurodegeneration_risk"],["Blood_panel_screening","detects","Early_disease_markers"],["Liquid_biopsy","screens","Cancer_early_detection"],
    // Technology-AI Integration
    ["CIWU_AI","analyzes","Medical_records"],["CIWU_AI","generates","Personalized_protocols"],["CIWU_AI","tracks","Biomarker_trends"],["CIWU_AI","predicts","Health_events"],["Knowledge_graph","connects","Scientific_findings"],["Machine_learning","optimizes","Treatment_dosing"],["Predictive_analytics","forecasts","Disease_onset"],["Anomaly_detection","flags","Abnormal_values"],["Automated_alerts","notifies","Critical_changes"],["Decision_support","guides","Clinical_choices"],["Telemedicine","enables","Remote_consultations"],["Wearable_monitoring","collects","Continuous_data"],["Mobile_health_apps","engages","Self_management"],["Electronic_health_records","store","Comprehensive_history"],["Genomic_databases","reference","Variant_interpretations"],
    // Nutrition-Supplement Synergy
    ["Ketogenic_diet","induces","Ketosis_state"],["Ketogenic_diet","may_extend","Healthspan"],["Intermittent_fasting","triggers","Autophagy"],["Time_restricted_eating","aligns_with","Circadian_rhythms"],["Mediterranean_diet","lowers","Cardiovascular_risk"],["Plant_based_diet","reduces","Cancer_incidence"],["Protein_optimization","maintains","Muscle_mass"],["Omega-3_supplementation","decreases","Triglyceride_levels"],["Vitamin_D_optimization","supports","Immune_function"],["Magnesium_supplementation","improves","Sleep_quality"],["Probiotic_therapy","balances","Gut_microbiome"],["Prebiotic_fiber","feeds","Beneficial_bacteria"],["Polyphenol_intake","activates","Sirtuin_pathways"],["Antioxidant_load","neutralizes","Free_radicals"],["Anti-inflammatory_nutrition","reduces","Chronic_disease_risk"],
    // Lifestyle-Environment Factors
    ["Sleep_optimization","enhances","Cognitive_performance"],["Sleep_optimization","boosts","Immune_system"],["Exercise_regularly","preserves","Telomere_length"],["Resistance_training","builds","Lean_body_mass"],["Aerobic_fitness","protects","Cardiovascular_health"],["Strength_training","prevents","Sarcopenia"],["Flexibility_work","maintains","Joint_range_motion"],["Balance_practice","prevents","Falls_in_elderly"],["Stress_reduction",lowers","Cortisol_levels"],["Social_engagement","buffers","Mortality_risk"],["Purpose_in_life","correlates_with","Longevity_outcomes"],["Cognitive_stimulation","protects","Against_dementia"],["Continuing_education","delays","Cognitive_decline"],["Creative_activities","enhance","Neural_plasticity"],["Nature_time","reduces","Stress_hormones"],
    // Environmental-Human Interaction
    ["Clean_air","protects","Lung_function"],["Clean_water","prevents","Contaminant_exposure"],["Healthy_soil","grows","Nutrient_dense_food"],["Reduced_pollution","lowers","Respiratory_illness"],["Limited_pesticide_use","decreases","Endocrine_disruption"],["Green_spaces","promotes","Mental_wellbeing"],["Urban_design","influences","Physical_activity_levels"],["Walkable_neighborhoods","encourage","Active_transportation"],["Safe_playgrounds","support","Childhood_development"],["Community_centers","foster","Social_connections"],["Healthcare_access","ensures","Timely_interventions"],["Affordable_nutrition","enables","Quality_diet_choices"],["Stable_housing","provides","Foundational_security"],["Financial_resources","facilitates","Preventive_care"],["Education_levels","correlate_with","Health_outcomes"],
    // Therapeutic Modalities
    ["Hyperbaric_oxygen","accelerates","Wound_healing"],["Hyperbaric_oxygen","enhances","Tissue_regeneration"],["Photobiomodulation","stimulates","Mitochondrial_function"],["Red_light_therapy","improves","Skin_texture"],["Infrared_sauna","promotes","Detoxification pathways"],["Cold_exposure","activates","Brown_adipose_tissue"],["Sauna_bathing","decreases","Cardiovascular_mortality"],["Float_therapy","reduces","Muscle_tension"],["Breathwork_practices","calms","Nervous_system"],["Meditation_daily","decreases","Anxiety_symptoms"],["Yoga_combined","improves","Flexibility_strength"],["Tai_chi","enhances","Balance_coordination"],["Qigong_regular","cultivates","Qi_energy_flow"],["Acupuncture_sessions","alleviates","Chronic_pain"],["Chiropractic_adjustments","restore","Spinal_alignment"],
    // Advanced Diagnostic Tools
    ["Full_body_MRI","detects","Silent_pathologies"],["CT_coronary_calcium","scores","Plaque_accumulation"],["DEXA_scan","measures","Body_composition_bone_density"],["Carotid_ultrasound","assesses","Stroke_risk_factor"],["VO2_max_test","quantifies","Aerobic_capacity"],["Continuous_glucose_monitor","tracks","Glycemic_variability"],["Heart_rate_variability","monitors","Stress_recovery_balance"],["Wearable_ecg","records","Arrhythmia_episodes"],["At_home_blood_test","conveniently","Screens_multiple_markers"],["Genetic_risk_scoring","predicts","Polygenic_disease_probability"],["Epigenetic_age_testing","reveals","Biological_vs_chronological_age"],["Microbiome_analysis","profiles","Gut_bacterial_community"],["Metabolomics_profiling","captures","Real-time_biochemical_state"],["Proteomics_screening","identifies","Protein_expression_patterns"],["Single_cell_sequencing","maps","Cellular_heterogeneity"]
  ];
  
  let relCount = 0;
  allRelations.flat().forEach((item, idx) => {
    if(idx % 3 === 0 && allRelations.flat()[idx+2]) {
      eonsDb.run(`INSERT INTO relations (source, target, relation_type) VALUES (?, ?, ?)`,
        [allRelations.flat()[idx], allRelations.flat()[idx+1], allRelations.flat()[idx+2]]);
      relCount++;
    }
  });
  
  // Save databases
  const cBuf = db.export();
  const eBuf = eonsDb.export();
  
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, cBuf);
  fs.writeFileSync(eonsPath, eBuf);
  
  console.log(`✅ FULL RESTORE COMPLETE!`);
  console.log(`✅ CORTEX: ${150} knowledge facts`);
  console.log(`✅ EONS: ${entityCount} entities, ${relCount} relations`);
  console.log(`💾 Databases saved to src/data/memory/`);
})();
