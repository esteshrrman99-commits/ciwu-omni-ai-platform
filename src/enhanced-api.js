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

// ⚡ FULL 1763 ENTITIES EMBEDDED FROM MASTER EXPORT ⚡
const embeddedEntities = [
  {
    "id": 1,
    "name": "# Type: myName",
    "type": "concept",
    "description": ""
  },
  {
    "id": 2,
    "name": "[your name]",
    "type": "concept",
    "description": ""
  },
  {
    "id": 3,
    "name": "myName",
    "type": "concept",
    "description": ""
  },
  {
    "id": 4,
    "name": "John",
    "type": "concept",
    "description": ""
  },
  {
    "id": 5,
    "name": "bitcoin",
    "type": "concept",
    "description": ""
  },
  {
    "id": 6,
    "name": "cryptocurrency",
    "type": "concept",
    "description": ""
  },
  {
    "id": 7,
    "name": "Android",
    "type": "concept",
    "description": ""
  },
  {
    "id": 8,
    "name": "operating_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 9,
    "name": "Termux",
    "type": "concept",
    "description": ""
  },
  {
    "id": 10,
    "name": "android_terminal_emulator",
    "type": "concept",
    "description": ""
  },
  {
    "id": 11,
    "name": "Bitcoin",
    "type": "concept",
    "description": ""
  },
  {
    "id": 12,
    "name": "digital_currency",
    "type": "concept",
    "description": ""
  },
  {
    "id": 15,
    "name": "-d",
    "type": "concept",
    "description": ""
  },
  {
    "id": 16,
    "name": "\"Android is operating_system\"}'",
    "type": "concept",
    "description": ""
  },
  {
    "id": 17,
    "name": "Neural",
    "type": "concept",
    "description": ""
  },
  {
    "id": 18,
    "name": "is machine_learning_algorithm",
    "type": "concept",
    "description": ""
  },
  {
    "id": 19,
    "name": "Python",
    "type": "concept",
    "description": ""
  },
  {
    "id": 20,
    "name": "programming_language",
    "type": "concept",
    "description": ""
  },
  {
    "id": 21,
    "name": "SQL",
    "type": "concept",
    "description": ""
  },
  {
    "id": 22,
    "name": "database_query_language",
    "type": "concept",
    "description": ""
  },
  {
    "id": 23,
    "name": "Machine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 24,
    "name": "is artificial_intelligence_field",
    "type": "concept",
    "description": ""
  },
  {
    "id": 25,
    "name": "Large",
    "type": "concept",
    "description": ""
  },
  {
    "id": 26,
    "name": "Model is natural_language_processing_technology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 27,
    "name": "Operating",
    "type": "concept",
    "description": ""
  },
  {
    "id": 29,
    "name": "Linux",
    "type": "concept",
    "description": ""
  },
  {
    "id": 30,
    "name": "is software",
    "type": "concept",
    "description": ""
  },
  {
    "id": 31,
    "name": "mobile_operating_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 32,
    "name": "Unix_like_operating_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 34,
    "name": "Android_terminal_environment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 35,
    "name": "Artificial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 36,
    "name": "is technology_field",
    "type": "concept",
    "description": ""
  },
  {
    "id": 38,
    "name": "is AI_subfield",
    "type": "concept",
    "description": ""
  },
  {
    "id": 39,
    "name": "Deep",
    "type": "concept",
    "description": ""
  },
  {
    "id": 40,
    "name": "is machine_learning_technique",
    "type": "concept",
    "description": ""
  },
  {
    "id": 41,
    "name": "Transformer",
    "type": "concept",
    "description": ""
  },
  {
    "id": 42,
    "name": "neural_network_architecture",
    "type": "concept",
    "description": ""
  },
  {
    "id": 44,
    "name": "Model is Transformer_application",
    "type": "concept",
    "description": ""
  },
  {
    "id": 45,
    "name": "Programming",
    "type": "concept",
    "description": ""
  },
  {
    "id": 46,
    "name": "computer_science_practice",
    "type": "concept",
    "description": ""
  },
  {
    "id": 48,
    "name": "interpreted_programming_language",
    "type": "concept",
    "description": ""
  },
  {
    "id": 49,
    "name": "JavaScript",
    "type": "concept",
    "description": ""
  },
  {
    "id": 50,
    "name": "dynamic_programming_language",
    "type": "concept",
    "description": ""
  },
  {
    "id": 52,
    "name": "declarative_query_language",
    "type": "concept",
    "description": ""
  },
  {
    "id": 53,
    "name": "Vortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 54,
    "name": "Zortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 55,
    "name": "Lortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 56,
    "name": "Irotex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 57,
    "name": "Celltex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 58,
    "name": "Hertex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 59,
    "name": "Eontex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 60,
    "name": "Aurtex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 61,
    "name": "Surtex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 62,
    "name": "Cryptocurrency",
    "type": "concept",
    "description": ""
  },
  {
    "id": 64,
    "name": "Ethereum",
    "type": "concept",
    "description": ""
  },
  {
    "id": 65,
    "name": "Stock_Market",
    "type": "concept",
    "description": ""
  },
  {
    "id": 66,
    "name": "Options_Trading",
    "type": "concept",
    "description": ""
  },
  {
    "id": 67,
    "name": "Futures_Trading",
    "type": "concept",
    "description": ""
  },
  {
    "id": 68,
    "name": "FOREX_Trading",
    "type": "concept",
    "description": ""
  },
  {
    "id": 69,
    "name": "High_Frequency_Trading",
    "type": "concept",
    "description": ""
  },
  {
    "id": 70,
    "name": "Modern_Money_Mechanics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 71,
    "name": "Banking_Digital_Transformation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 72,
    "name": "Decentralized_Finance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 73,
    "name": "Smart_Contract",
    "type": "concept",
    "description": ""
  },
  {
    "id": 74,
    "name": "Blockchain",
    "type": "concept",
    "description": ""
  },
  {
    "id": 75,
    "name": "Tokenization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 76,
    "name": "Stablecoin",
    "type": "concept",
    "description": ""
  },
  {
    "id": 77,
    "name": "Mining",
    "type": "concept",
    "description": ""
  },
  {
    "id": 78,
    "name": "Staking",
    "type": "concept",
    "description": ""
  },
  {
    "id": 79,
    "name": "Liquidity_Pool",
    "type": "concept",
    "description": ""
  },
  {
    "id": 80,
    "name": "Yield_Farming",
    "type": "concept",
    "description": ""
  },
  {
    "id": 81,
    "name": "Flash_Credit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 82,
    "name": "Cross_Chain_Bridge",
    "type": "concept",
    "description": ""
  },
  {
    "id": 83,
    "name": "Human_Skeletal_Structure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 84,
    "name": "Cranial_Bones",
    "type": "concept",
    "description": ""
  },
  {
    "id": 85,
    "name": "Facial_Bones",
    "type": "concept",
    "description": ""
  },
  {
    "id": 86,
    "name": "Vertebral_Column",
    "type": "concept",
    "description": ""
  },
  {
    "id": 87,
    "name": "Cervical_Vertebrae",
    "type": "concept",
    "description": ""
  },
  {
    "id": 88,
    "name": "Thoracic_Vertebrate",
    "type": "concept",
    "description": ""
  },
  {
    "id": 89,
    "name": "Lumbar_Vertebrate",
    "type": "concept",
    "description": ""
  },
  {
    "id": 90,
    "name": "Sacrum_Coccyx",
    "type": "concept",
    "description": ""
  },
  {
    "id": 91,
    "name": "Ribs_Thorax",
    "type": "concept",
    "description": ""
  },
  {
    "id": 92,
    "name": "Shoulder_Girdle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 93,
    "name": "Pelvic_Girdle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 94,
    "name": "Appendicular_Skeleton",
    "type": "concept",
    "description": ""
  },
  {
    "id": 95,
    "name": "Axial_Skeleton",
    "type": "concept",
    "description": ""
  },
  {
    "id": 96,
    "name": "Joints_Anatomy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 97,
    "name": "core_cell_regeneration_unit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 98,
    "name": "advanced_cellular_architecture",
    "type": "concept",
    "description": ""
  },
  {
    "id": 99,
    "name": "neural_connectivity_structure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 100,
    "name": "tissue_regeneration_interface",
    "type": "concept",
    "description": ""
  },
  {
    "id": 101,
    "name": "stem_cell_compartment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 102,
    "name": "cardiovascular_tissue_module",
    "type": "concept",
    "description": ""
  },
  {
    "id": 103,
    "name": "temporal_cell_growth_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 104,
    "name": "auricular_neural_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 105,
    "name": "surface_epithelial_layer",
    "type": "concept",
    "description": ""
  },
  {
    "id": 106,
    "name": "decentralized_digital_asset",
    "type": "concept",
    "description": ""
  },
  {
    "id": 107,
    "name": "first_cryptocurrency_implementations",
    "type": "concept",
    "description": ""
  },
  {
    "id": 108,
    "name": "smart_contract_platform",
    "type": "concept",
    "description": ""
  },
  {
    "id": 109,
    "name": "equity_trading_exchange",
    "type": "concept",
    "description": ""
  },
  {
    "id": 110,
    "name": "derivative_finance_instrument",
    "type": "concept",
    "description": ""
  },
  {
    "id": 111,
    "name": "standardized_contract_obligation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 112,
    "name": "currency_exchange_market",
    "type": "concept",
    "description": ""
  },
  {
    "id": 113,
    "name": "algorithmic_trading_strategy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 114,
    "name": "digital_transaction_framework",
    "type": "concept",
    "description": ""
  },
  {
    "id": 115,
    "name": "fintech_infrastructure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 116,
    "name": "blockchain_based_financial_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 117,
    "name": "self_executing_agreement_protocol",
    "type": "concept",
    "description": ""
  },
  {
    "id": 118,
    "name": "distributed_ledger_technology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 119,
    "name": "asset_digitization_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 120,
    "name": "price_stabilized_cryptocurrency",
    "type": "concept",
    "description": ""
  },
  {
    "id": 121,
    "name": "blockchain_consensus_mechanism",
    "type": "concept",
    "description": ""
  },
  {
    "id": 122,
    "name": "proof_of_stake_validation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 123,
    "name": "decentralized_exchange_reserve",
    "type": "concept",
    "description": ""
  },
  {
    "id": 124,
    "name": "liquidity_provision_reward",
    "type": "concept",
    "description": ""
  },
  {
    "id": 125,
    "name": "instantaneous_loan_protocol",
    "type": "concept",
    "description": ""
  },
  {
    "id": 126,
    "name": "blockchain_interoperability_layer",
    "type": "concept",
    "description": ""
  },
  {
    "id": 127,
    "name": "bony_support_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 128,
    "name": "skull_anatomy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 129,
    "name": "facial_structure_components",
    "type": "concept",
    "description": ""
  },
  {
    "id": 130,
    "name": "spine_anatomy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 131,
    "name": "neck_spine_segment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 132,
    "name": "upper_back_spine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 133,
    "name": "lower_back_spine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 134,
    "name": "pelvic_spine_base",
    "type": "concept",
    "description": ""
  },
  {
    "id": 135,
    "name": "chest_protection_structure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 136,
    "name": "upper limb_attachment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 137,
    "name": "lower_body_support_frame",
    "type": "concept",
    "description": ""
  },
  {
    "id": 138,
    "name": "limb_bone_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 139,
    "name": "core_body_structure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 140,
    "name": "bone_connection_points",
    "type": "concept",
    "description": ""
  },
  {
    "id": 141,
    "name": "Ligaments",
    "type": "concept",
    "description": ""
  },
  {
    "id": 142,
    "name": "Tendons",
    "type": "concept",
    "description": ""
  },
  {
    "id": 143,
    "name": "Central_Nervous_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 144,
    "name": "Peripheral_Nervous_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 145,
    "name": "Brain_Anatomy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 146,
    "name": "Cerebrum",
    "type": "concept",
    "description": ""
  },
  {
    "id": 147,
    "name": "Cerebellum",
    "type": "concept",
    "description": ""
  },
  {
    "id": 148,
    "name": "Brain_Stem",
    "type": "concept",
    "description": ""
  },
  {
    "id": 149,
    "name": "Cerebral_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 150,
    "name": "Frontal_Lobe",
    "type": "concept",
    "description": ""
  },
  {
    "id": 151,
    "name": "Parietal_Lobe",
    "type": "concept",
    "description": ""
  },
  {
    "id": 152,
    "name": "Temporal_Lobe",
    "type": "concept",
    "description": ""
  },
  {
    "id": 153,
    "name": "Occipital_Lobe",
    "type": "concept",
    "description": ""
  },
  {
    "id": 154,
    "name": "Limbic_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 155,
    "name": "Hippocampus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 156,
    "name": "Amygdala",
    "type": "concept",
    "description": ""
  },
  {
    "id": 157,
    "name": "Thalamus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 158,
    "name": "Hypothalamus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 159,
    "name": "Basal_Ganglia",
    "type": "concept",
    "description": ""
  },
  {
    "id": 160,
    "name": "Brain_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 161,
    "name": "White_Matter",
    "type": "concept",
    "description": ""
  },
  {
    "id": 162,
    "name": "Grey_Matter",
    "type": "concept",
    "description": ""
  },
  {
    "id": 163,
    "name": "Spinal_Cord",
    "type": "concept",
    "description": ""
  },
  {
    "id": 164,
    "name": "Spinal_Nerves",
    "type": "concept",
    "description": ""
  },
  {
    "id": 165,
    "name": "Autonomic_Nervous_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 166,
    "name": "Sympathetic_Nervous_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 167,
    "name": "Parasympathetic_Nervous_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 168,
    "name": "Heart_Anatomy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 169,
    "name": "Cardiac_Muscle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 170,
    "name": "Blood_Vessels",
    "type": "concept",
    "description": ""
  },
  {
    "id": 171,
    "name": "Arteries",
    "type": "concept",
    "description": ""
  },
  {
    "id": 172,
    "name": "Veins",
    "type": "concept",
    "description": ""
  },
  {
    "id": 173,
    "name": "Capillaries",
    "type": "concept",
    "description": ""
  },
  {
    "id": 174,
    "name": "Cardiovascular_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 175,
    "name": "Pulmonary_Circulation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 176,
    "name": "Systemic_Circulation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 177,
    "name": "Kidney_Anatomy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 178,
    "name": "Nephron",
    "type": "concept",
    "description": ""
  },
  {
    "id": 179,
    "name": "Urinary_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 180,
    "name": "Liver_Anatomy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 181,
    "name": "Hepatic_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 182,
    "name": "Gallbladder",
    "type": "concept",
    "description": ""
  },
  {
    "id": 183,
    "name": "Pancreas",
    "type": "concept",
    "description": ""
  },
  {
    "id": 184,
    "name": "Spleen_Anatomy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 185,
    "name": "Lymphatic_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 186,
    "name": "Immune_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 187,
    "name": "Colon_Anatomy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 188,
    "name": "Intestines",
    "type": "concept",
    "description": ""
  },
  {
    "id": 189,
    "name": "Digestive_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 190,
    "name": "Respiratory_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 191,
    "name": "Pulmonary_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 192,
    "name": "Alveoli",
    "type": "concept",
    "description": ""
  },
  {
    "id": 193,
    "name": "Endocrine_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 194,
    "name": "Reproductive_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 195,
    "name": "DNA_Analysis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 196,
    "name": "RNA_Function",
    "type": "concept",
    "description": ""
  },
  {
    "id": 197,
    "name": "Chromosome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 198,
    "name": "Gene",
    "type": "concept",
    "description": ""
  },
  {
    "id": 199,
    "name": "Genome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 200,
    "name": "Nucleus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 201,
    "name": "Mitochondria",
    "type": "concept",
    "description": ""
  },
  {
    "id": 202,
    "name": "Ribosome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 203,
    "name": "Cytoplasm",
    "type": "concept",
    "description": ""
  },
  {
    "id": 204,
    "name": "Cell_Membrane",
    "type": "concept",
    "description": ""
  },
  {
    "id": 205,
    "name": "Stem_Cell_Regeneration",
    "type": "concept",
    "description": ""
  },
  {
    "id": 206,
    "name": "Embryonic_Stem_Cell",
    "type": "concept",
    "description": ""
  },
  {
    "id": 207,
    "name": "bone_to_bone_connector",
    "type": "concept",
    "description": ""
  },
  {
    "id": 208,
    "name": "muscle_to_bone_attachment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 209,
    "name": "neural_control_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 210,
    "name": "body_nerve_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 211,
    "name": "cns_command_center",
    "type": "concept",
    "description": ""
  },
  {
    "id": 212,
    "name": "higher_thinking_region",
    "type": "concept",
    "description": ""
  },
  {
    "id": 213,
    "name": "motor_coordination_center",
    "type": "concept",
    "description": ""
  },
  {
    "id": 214,
    "name": "vital_functions_controller",
    "type": "concept",
    "description": ""
  },
  {
    "id": 215,
    "name": "outer_brain_processing_layer",
    "type": "concept",
    "description": ""
  },
  {
    "id": 216,
    "name": "executive_decision_area",
    "type": "concept",
    "description": ""
  },
  {
    "id": 217,
    "name": "sensory_integration_zone",
    "type": "concept",
    "description": ""
  },
  {
    "id": 218,
    "name": "auditory_memory_region",
    "type": "concept",
    "description": ""
  },
  {
    "id": 219,
    "name": "visual_processing_center",
    "type": "concept",
    "description": ""
  },
  {
    "id": 220,
    "name": "emotional_processing_center",
    "type": "concept",
    "description": ""
  },
  {
    "id": 221,
    "name": "memory_formation_structure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 222,
    "name": "emotional_response_generator",
    "type": "concept",
    "description": ""
  },
  {
    "id": 223,
    "name": "sensory_relay_station",
    "type": "concept",
    "description": ""
  },
  {
    "id": 224,
    "name": "homeostasis_regulator",
    "type": "concept",
    "description": ""
  },
  {
    "id": 225,
    "name": "movement_control_nuclei",
    "type": "concept",
    "description": ""
  },
  {
    "id": 226,
    "name": "cerebral_processing_layer",
    "type": "concept",
    "description": ""
  },
  {
    "id": 227,
    "name": "myelinated_nerve_fibers",
    "type": "concept",
    "description": ""
  },
  {
    "id": 228,
    "name": "neuron_cell_body_regions",
    "type": "concept",
    "description": ""
  },
  {
    "id": 229,
    "name": "nerve_pathway_bypass",
    "type": "concept",
    "description": ""
  },
  {
    "id": 230,
    "name": "peripheral_nerve_origins",
    "type": "concept",
    "description": ""
  },
  {
    "id": 231,
    "name": "involuntary_control_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 232,
    "name": "fight_or_flight_response",
    "type": "concept",
    "description": ""
  },
  {
    "id": 233,
    "name": "rest_and_digest_function",
    "type": "concept",
    "description": ""
  },
  {
    "id": 234,
    "name": "cardiovascular_pump_organ",
    "type": "concept",
    "description": ""
  },
  {
    "id": 235,
    "name": "heart_tissue_type",
    "type": "concept",
    "description": ""
  },
  {
    "id": 236,
    "name": "circulatory_transport_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 237,
    "name": "oxygenated_blood_carriers",
    "type": "concept",
    "description": ""
  },
  {
    "id": 238,
    "name": "deoxygenated_blood_return",
    "type": "concept",
    "description": ""
  },
  {
    "id": 239,
    "name": "microcirculation_exchange_sites",
    "type": "concept",
    "description": ""
  },
  {
    "id": 240,
    "name": "blood_transport_circuit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 241,
    "name": "lung_blood_loop",
    "type": "concept",
    "description": ""
  },
  {
    "id": 242,
    "name": "body_blood_distribution",
    "type": "concept",
    "description": ""
  },
  {
    "id": 243,
    "name": "filtration_excretion_organ",
    "type": "concept",
    "description": ""
  },
  {
    "id": 244,
    "name": "kidney_functional_unit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 245,
    "name": "waste_elimination_pathway",
    "type": "concept",
    "description": ""
  },
  {
    "id": 246,
    "name": "metabolic_processing_organ",
    "type": "concept",
    "description": ""
  },
  {
    "id": 247,
    "name": "detoxification_metabolism_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 248,
    "name": "bile_storage_organ",
    "type": "concept",
    "description": ""
  },
  {
    "id": 249,
    "name": "endocrine_exocrine_gland",
    "type": "concept",
    "description": ""
  },
  {
    "id": 250,
    "name": "immune_filtration_organ",
    "type": "concept",
    "description": ""
  },
  {
    "id": 251,
    "name": "fluid_balance_defense_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 252,
    "name": "pathogen_defense_organization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 253,
    "name": "digestive_waste_processor",
    "type": "concept",
    "description": ""
  },
  {
    "id": 254,
    "name": "nutrient_absorption_tube",
    "type": "concept",
    "description": ""
  },
  {
    "id": 255,
    "name": "nutrient_processing_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 256,
    "name": "gas_exchange_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 257,
    "name": "breathing_mechanism",
    "type": "concept",
    "description": ""
  },
  {
    "id": 258,
    "name": "gas_exchange_micro_sacs",
    "type": "concept",
    "description": ""
  },
  {
    "id": 259,
    "name": "hormone_signaling_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 260,
    "name": "offspring_generation_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 261,
    "name": "genetic_code_structure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 262,
    "name": "protein_synthesis_messenger",
    "type": "concept",
    "description": ""
  },
  {
    "id": 263,
    "name": "DNA_packaging_structure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 264,
    "name": "hereditary_information_unit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 265,
    "name": "complete_genetic_blueprint",
    "type": "concept",
    "description": ""
  },
  {
    "id": 266,
    "name": "cellular_control_center",
    "type": "concept",
    "description": ""
  },
  {
    "id": 267,
    "name": "cellular_energy_powerhouse",
    "type": "concept",
    "description": ""
  },
  {
    "id": 268,
    "name": "protein_synthesis_machine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 269,
    "name": "intracellular_fluid_medium",
    "type": "concept",
    "description": ""
  },
  {
    "id": 270,
    "name": "boundary_permeability_barrier",
    "type": "concept",
    "description": ""
  },
  {
    "id": 271,
    "name": "undifferentiated_cell_restoration",
    "type": "concept",
    "description": ""
  },
  {
    "id": 272,
    "name": "pluripotent_source_type",
    "type": "concept",
    "description": ""
  },
  {
    "id": 273,
    "name": "ult_Stem_Cell",
    "type": "concept",
    "description": ""
  },
  {
    "id": 274,
    "name": "Induced_Pluripotent_Stem_Cell",
    "type": "concept",
    "description": ""
  },
  {
    "id": 275,
    "name": "Mesenchymal_Stem_Cell",
    "type": "concept",
    "description": ""
  },
  {
    "id": 276,
    "name": "Hematopoietic_Stem_Cell",
    "type": "concept",
    "description": ""
  },
  {
    "id": 277,
    "name": "Neural_Stem_Cell",
    "type": "concept",
    "description": ""
  },
  {
    "id": 278,
    "name": "Epithelial_Stem_Cell",
    "type": "concept",
    "description": ""
  },
  {
    "id": 279,
    "name": "Mitosis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 280,
    "name": "Meiosis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 281,
    "name": "Apoptosis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 282,
    "name": "Necrosis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 283,
    "name": "Cell_Cycle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 284,
    "name": "Telomeres",
    "type": "concept",
    "description": ""
  },
  {
    "id": 285,
    "name": "Epigenetics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 286,
    "name": "Methylation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 287,
    "name": "Histone_Modification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 288,
    "name": "Gene_Expression",
    "type": "concept",
    "description": ""
  },
  {
    "id": 289,
    "name": "Transcription",
    "type": "concept",
    "description": ""
  },
  {
    "id": 290,
    "name": "Translation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 291,
    "name": "Protein_Folding",
    "type": "concept",
    "description": ""
  },
  {
    "id": 292,
    "name": "Enzyme",
    "type": "concept",
    "description": ""
  },
  {
    "id": 293,
    "name": "Hormone",
    "type": "concept",
    "description": ""
  },
  {
    "id": 294,
    "name": "Neurotransmitter",
    "type": "concept",
    "description": ""
  },
  {
    "id": 295,
    "name": "Neuron",
    "type": "concept",
    "description": ""
  },
  {
    "id": 296,
    "name": "Dendrite",
    "type": "concept",
    "description": ""
  },
  {
    "id": 297,
    "name": "Axon",
    "type": "concept",
    "description": ""
  },
  {
    "id": 298,
    "name": "Myelin_Sheath",
    "type": "concept",
    "description": ""
  },
  {
    "id": 299,
    "name": "Synapse",
    "type": "concept",
    "description": ""
  },
  {
    "id": 300,
    "name": "Neurotransmitters",
    "type": "concept",
    "description": ""
  },
  {
    "id": 301,
    "name": "Dopamine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 302,
    "name": "Serotonin",
    "type": "concept",
    "description": ""
  },
  {
    "id": 303,
    "name": "Glutamate",
    "type": "concept",
    "description": ""
  },
  {
    "id": 304,
    "name": "GABA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 305,
    "name": "Acetylcholine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 306,
    "name": "Neuroplasticity",
    "type": "concept",
    "description": ""
  },
  {
    "id": 307,
    "name": "Synaptic_Pruning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 308,
    "name": "Long_Term_Potentiation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 309,
    "name": "Neurogenesis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 310,
    "name": "Motor_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 311,
    "name": "Sensory_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 312,
    "name": "Auditory_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 313,
    "name": "Visual_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 314,
    "name": "Prefrontal_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 315,
    "name": "Language_Centers",
    "type": "concept",
    "description": ""
  },
  {
    "id": 316,
    "name": "Wernicke_Area",
    "type": "concept",
    "description": ""
  },
  {
    "id": 317,
    "name": "Broca_Area",
    "type": "concept",
    "description": ""
  },
  {
    "id": 318,
    "name": "Artificial_Intelligence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 319,
    "name": "Machine_Learning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 320,
    "name": "Deep_Learning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 321,
    "name": "Neural_Network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 322,
    "name": "Convolutional_Neural_Network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 323,
    "name": "Recurrent_Neural_Network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 324,
    "name": "Transformer_Architecture",
    "type": "concept",
    "description": ""
  },
  {
    "id": 325,
    "name": "Large_Language_Model",
    "type": "concept",
    "description": ""
  },
  {
    "id": 326,
    "name": "Generative_AI",
    "type": "concept",
    "description": ""
  },
  {
    "id": 327,
    "name": "Reinforcement_Learning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 328,
    "name": "Supervised_Learning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 329,
    "name": "Unsupervised_Learning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 330,
    "name": "Semi_Supervised_Learning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 331,
    "name": "Transfer_Learning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 332,
    "name": "Ensemble_Learning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 333,
    "name": "Feature_Engineering",
    "type": "concept",
    "description": ""
  },
  {
    "id": 334,
    "name": "Model_Training",
    "type": "concept",
    "description": ""
  },
  {
    "id": 335,
    "name": "Model_Inference",
    "type": "concept",
    "description": ""
  },
  {
    "id": 336,
    "name": "tissue_specific_regenerationAd",
    "type": "concept",
    "description": ""
  },
  {
    "id": 337,
    "name": "reprogrammed_adult_cell",
    "type": "concept",
    "description": ""
  },
  {
    "id": 338,
    "name": "connective_tissue_derived",
    "type": "concept",
    "description": ""
  },
  {
    "id": 339,
    "name": "blood_cell_origin",
    "type": "concept",
    "description": ""
  },
  {
    "id": 340,
    "name": "nervous_system_regeneration",
    "type": "concept",
    "description": ""
  },
  {
    "id": 341,
    "name": "lining_tissue_renewal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 342,
    "name": "cellular_division_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 343,
    "name": "reproductive_cell_formation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 344,
    "name": "programmed_cell_death",
    "type": "concept",
    "description": ""
  },
  {
    "id": 345,
    "name": "traumatic_cell_death",
    "type": "concept",
    "description": ""
  },
  {
    "id": 346,
    "name": "division_progression_sequence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 347,
    "name": "chromosomal_protection_cap",
    "type": "concept",
    "description": ""
  },
  {
    "id": 348,
    "name": "gene_expression_modification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 349,
    "name": "DNA_tagging_regulation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 350,
    "name": "chromatin_access_control",
    "type": "concept",
    "description": ""
  },
  {
    "id": 351,
    "name": "protein_production_activation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 352,
    "name": "RNA_synthesis_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 353,
    "name": "protein_synthesis_step",
    "type": "concept",
    "description": ""
  },
  {
    "id": 354,
    "name": "three_dimensional_structure_formation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 355,
    "name": "biological_catalyst_molecule",
    "type": "concept",
    "description": ""
  },
  {
    "id": 356,
    "name": "chemical_signaling_messenger",
    "type": "concept",
    "description": ""
  },
  {
    "id": 357,
    "name": "neural_signal_chemical",
    "type": "concept",
    "description": ""
  },
  {
    "id": 358,
    "name": "neural_communication_cell",
    "type": "concept",
    "description": ""
  },
  {
    "id": 359,
    "name": "signal_receiving_branch",
    "type": "concept",
    "description": ""
  },
  {
    "id": 360,
    "name": "signal_transmission_cable",
    "type": "concept",
    "description": ""
  },
  {
    "id": 361,
    "name": "axon_insulating_layer",
    "type": "concept",
    "description": ""
  },
  {
    "id": 362,
    "name": "neurotransmitter_release_junction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 363,
    "name": "synaptic_chemical_messengers",
    "type": "concept",
    "description": ""
  },
  {
    "id": 364,
    "name": "reward_motivation_chemical",
    "type": "concept",
    "description": ""
  },
  {
    "id": 365,
    "name": "mood_regulation_chemical",
    "type": "concept",
    "description": ""
  },
  {
    "id": 366,
    "name": "excitatory_neural_chemical",
    "type": "concept",
    "description": ""
  },
  {
    "id": 367,
    "name": "inhibitory_neural_chemical",
    "type": "concept",
    "description": ""
  },
  {
    "id": 368,
    "name": "muscle_activation_chemical",
    "type": "concept",
    "description": ""
  },
  {
    "id": 369,
    "name": "brain_adaptability_capacity",
    "type": "concept",
    "description": ""
  },
  {
    "id": 370,
    "name": "connection_optimization_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 371,
    "name": "memory_strengthening_mechanism",
    "type": "concept",
    "description": ""
  },
  {
    "id": 372,
    "name": "new_neuron_creation_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 373,
    "name": "movement_execution_zone",
    "type": "concept",
    "description": ""
  },
  {
    "id": 374,
    "name": "perception_processing_region",
    "type": "concept",
    "description": ""
  },
  {
    "id": 375,
    "name": "sound_processing_area",
    "type": "concept",
    "description": ""
  },
  {
    "id": 376,
    "name": "sight_processing_region",
    "type": "concept",
    "description": ""
  },
  {
    "id": 378,
    "name": "communication_processing_regions",
    "type": "concept",
    "description": ""
  },
  {
    "id": 379,
    "name": "language_comprehension_zone",
    "type": "concept",
    "description": ""
  },
  {
    "id": 380,
    "name": "speech_production_zone",
    "type": "concept",
    "description": ""
  },
  {
    "id": 381,
    "name": "intelligent_system_field",
    "type": "concept",
    "description": ""
  },
  {
    "id": 382,
    "name": "AI_learning_subfield",
    "type": "concept",
    "description": ""
  },
  {
    "id": 383,
    "name": "neural_network_hierarchy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 384,
    "name": "brain_connection_matrix",
    "type": "concept",
    "description": ""
  },
  {
    "id": 385,
    "name": "image_recognition_architecture",
    "type": "concept",
    "description": ""
  },
  {
    "id": 386,
    "name": "sequential_data_architecture",
    "type": "concept",
    "description": ""
  },
  {
    "id": 387,
    "name": "attention_mechanism_model",
    "type": "concept",
    "description": ""
  },
  {
    "id": 388,
    "name": "text_generation_technology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 389,
    "name": "content_creation_technology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 390,
    "name": "reward_based_training_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 391,
    "name": "labeled_data_training",
    "type": "concept",
    "description": ""
  },
  {
    "id": 392,
    "name": "pattern_discovery_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 393,
    "name": "mixed_label_training",
    "type": "concept",
    "description": ""
  },
  {
    "id": 394,
    "name": "knowledge_application_technique",
    "type": "concept",
    "description": ""
  },
  {
    "id": 395,
    "name": "multi_model_combination",
    "type": "concept",
    "description": ""
  },
  {
    "id": 396,
    "name": "input_optimization_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 397,
    "name": "parameter_adjustment_phase",
    "type": "concept",
    "description": ""
  },
  {
    "id": 398,
    "name": "prediction_execution_stage",
    "type": "concept",
    "description": ""
  },
  {
    "id": 399,
    "name": "emorizationOverfitting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 400,
    "name": "Underfitting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 401,
    "name": "Regularization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 402,
    "name": "Gradient_Descent",
    "type": "concept",
    "description": ""
  },
  {
    "id": 403,
    "name": "Backpropagation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 404,
    "name": "Batch_Normalization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 405,
    "name": "Dropout",
    "type": "concept",
    "description": ""
  },
  {
    "id": 406,
    "name": "Computer_Vision",
    "type": "concept",
    "description": ""
  },
  {
    "id": 407,
    "name": "Natural_Language_Processing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 408,
    "name": "Speech_Recognition",
    "type": "concept",
    "description": ""
  },
  {
    "id": 409,
    "name": "Recommendation_Systems",
    "type": "concept",
    "description": ""
  },
  {
    "id": 410,
    "name": "Predictive_Analytics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 411,
    "name": "Anomaly_Detection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 412,
    "name": "Clustering",
    "type": "concept",
    "description": ""
  },
  {
    "id": 413,
    "name": "Classification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 414,
    "name": "Regression",
    "type": "concept",
    "description": ""
  },
  {
    "id": 415,
    "name": "Dimensionality_Reduction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 416,
    "name": "Autonomous_Coding_Loop",
    "type": "concept",
    "description": ""
  },
  {
    "id": 417,
    "name": "Screenshot_Recognition",
    "type": "concept",
    "description": ""
  },
  {
    "id": 418,
    "name": "Termux_Integration",
    "type": "concept",
    "description": ""
  },
  {
    "id": 419,
    "name": "GitHub_Automation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 420,
    "name": "Continuous_Iteration",
    "type": "concept",
    "description": ""
  },
  {
    "id": 421,
    "name": "AI_to_AI_Communication",
    "type": "concept",
    "description": ""
  },
  {
    "id": 422,
    "name": "Code_Generation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 423,
    "name": "Self_Correction_Loop",
    "type": "concept",
    "description": ""
  },
  {
    "id": 424,
    "name": "Knowledge_Base_Integration",
    "type": "concept",
    "description": ""
  },
  {
    "id": 425,
    "name": "Real_Time_Deployment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 426,
    "name": "Quantum_Computing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 427,
    "name": "Qubit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 428,
    "name": "Superposition",
    "type": "concept",
    "description": ""
  },
  {
    "id": 429,
    "name": "Entanglement",
    "type": "concept",
    "description": ""
  },
  {
    "id": 430,
    "name": "Quantum_Gate",
    "type": "concept",
    "description": ""
  },
  {
    "id": 431,
    "name": "Quantum_Algorithm",
    "type": "concept",
    "description": ""
  },
  {
    "id": 432,
    "name": "Shors_Algorithm",
    "type": "concept",
    "description": ""
  },
  {
    "id": 433,
    "name": "Grovers_Algorithm",
    "type": "concept",
    "description": ""
  },
  {
    "id": 434,
    "name": "Quantum_Error_Correction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 435,
    "name": "Decoherence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 436,
    "name": "Quantum_Simulation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 437,
    "name": "Topological_Qubits",
    "type": "concept",
    "description": ""
  },
  {
    "id": 438,
    "name": "Quantum_Interference",
    "type": "concept",
    "description": ""
  },
  {
    "id": 439,
    "name": "Quantum_Tunneling",
    "type": "concept",
    "description": ""
  },
  {
    "id": 440,
    "name": "Planck_Constant",
    "type": "concept",
    "description": ""
  },
  {
    "id": 441,
    "name": "Heisenberg_Uncertainty",
    "type": "concept",
    "description": ""
  },
  {
    "id": 442,
    "name": "Wave_Function",
    "type": "concept",
    "description": ""
  },
  {
    "id": 443,
    "name": "Quantum_Field_Theory",
    "type": "concept",
    "description": ""
  },
  {
    "id": 444,
    "name": "Standard_Model",
    "type": "concept",
    "description": ""
  },
  {
    "id": 445,
    "name": "Dark_Matter",
    "type": "concept",
    "description": ""
  },
  {
    "id": 446,
    "name": "Zero_Knowledge_Proof",
    "type": "concept",
    "description": ""
  },
  {
    "id": 447,
    "name": "End_to_End_Encryption",
    "type": "concept",
    "description": ""
  },
  {
    "id": 448,
    "name": "Homomorphic_Encryption",
    "type": "concept",
    "description": ""
  },
  {
    "id": 449,
    "name": "Post_Quantum_Cryptography",
    "type": "concept",
    "description": ""
  },
  {
    "id": 450,
    "name": "Blockchain_Security",
    "type": "concept",
    "description": ""
  },
  {
    "id": 451,
    "name": "Smart_Contract_Audit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 452,
    "name": "Multi_Signature_Wallet",
    "type": "concept",
    "description": ""
  },
  {
    "id": 453,
    "name": "Hardware_Security_Module",
    "type": "concept",
    "description": ""
  },
  {
    "id": 454,
    "name": "Differential_Privacy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 455,
    "name": "Secure_Multi_Party_Computation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 456,
    "name": "Trusted_Execution_Environment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 457,
    "name": "excessive_pattern_m",
    "type": "concept",
    "description": ""
  },
  {
    "id": 458,
    "name": "insufficient_learning_problem",
    "type": "concept",
    "description": ""
  },
  {
    "id": 459,
    "name": "complexity_control_technique",
    "type": "concept",
    "description": ""
  },
  {
    "id": 460,
    "name": "optimization_algorithm",
    "type": "concept",
    "description": ""
  },
  {
    "id": 461,
    "name": "weight_update_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 462,
    "name": "training_stabilization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 463,
    "name": "regularization_technique",
    "type": "concept",
    "description": ""
  },
  {
    "id": 464,
    "name": "visual_interpretation_capability",
    "type": "concept",
    "description": ""
  },
  {
    "id": 465,
    "name": "language_understanding_technique",
    "type": "concept",
    "description": ""
  },
  {
    "id": 466,
    "name": "audio_text_conversion",
    "type": "concept",
    "description": ""
  },
  {
    "id": 467,
    "name": "personalization_engine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 468,
    "name": "future_outcome_forecasting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 469,
    "name": "outlier_identification_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 470,
    "name": "unsupervised_grouping_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 471,
    "name": "supervised_category_assignment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 472,
    "name": "continuous_value_prediction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 473,
    "name": "feature_simplification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 474,
    "name": "self_sustaining_development_cycle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 475,
    "name": "visual_code_input_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 476,
    "name": "android_terminal_environment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 477,
    "name": "version_control_automation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 478,
    "name": "perpetual_improvement_loop",
    "type": "concept",
    "description": ""
  },
  {
    "id": 479,
    "name": "automated_system_handshake",
    "type": "concept",
    "description": ""
  },
  {
    "id": 480,
    "name": "automatic_program_creation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 481,
    "name": "error_detection_fix_cycle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 482,
    "name": "learning_memory_storage",
    "type": "concept",
    "description": ""
  },
  {
    "id": 483,
    "name": "instant_production_publishing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 484,
    "name": "physics_computation_field",
    "type": "concept",
    "description": ""
  },
  {
    "id": 485,
    "name": "quantum_information_unit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 486,
    "name": "quantum_state_property",
    "type": "concept",
    "description": ""
  },
  {
    "id": 487,
    "name": "quantum_correlation_phenomenon",
    "type": "concept",
    "description": ""
  },
  {
    "id": 488,
    "name": "quantum_operation_primitive",
    "type": "concept",
    "description": ""
  },
  {
    "id": 489,
    "name": "quantum_processing_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 490,
    "name": "quantum_factorization_protocol",
    "type": "concept",
    "description": ""
  },
  {
    "id": 491,
    "name": "quantum_search_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 492,
    "name": "noise_reduction_technique",
    "type": "concept",
    "description": ""
  },
  {
    "id": 493,
    "name": "quantum_state_loss_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 494,
    "name": "molecular_modeling_application",
    "type": "concept",
    "description": ""
  },
  {
    "id": 495,
    "name": "fault_tolerant_computing_approach",
    "type": "concept",
    "description": ""
  },
  {
    "id": 496,
    "name": "wave_probability_phenomenon",
    "type": "concept",
    "description": ""
  },
  {
    "id": 497,
    "name": "barrier_penetration_effect",
    "type": "concept",
    "description": ""
  },
  {
    "id": 498,
    "name": "fundamental_physical_constant",
    "type": "concept",
    "description": ""
  },
  {
    "id": 499,
    "name": "measurement_limit_principle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 500,
    "name": "probability_amplitude_description",
    "type": "concept",
    "description": ""
  },
  {
    "id": 501,
    "name": "particle_physics_framework",
    "type": "concept",
    "description": ""
  },
  {
    "id": 502,
    "name": "elementary_particle_classification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 503,
    "name": "gravitational_mass_component",
    "type": "concept",
    "description": ""
  },
  {
    "id": 504,
    "name": "privacy_verification_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 505,
    "name": "secure_communication_protocol",
    "type": "concept",
    "description": ""
  },
  {
    "id": 506,
    "name": "computation_on_encrypted_data",
    "type": "concept",
    "description": ""
  },
  {
    "id": 507,
    "name": "quantum_resistant_algorithm",
    "type": "concept",
    "description": ""
  },
  {
    "id": 508,
    "name": "distributed_ledger_protection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 509,
    "name": "code_security_review",
    "type": "concept",
    "description": ""
  },
  {
    "id": 510,
    "name": "transaction_authorization_scheme",
    "type": "concept",
    "description": ""
  },
  {
    "id": 511,
    "name": "cryptographic_key_storage",
    "type": "concept",
    "description": ""
  },
  {
    "id": 512,
    "name": "statistical_anonymization_technique",
    "type": "concept",
    "description": ""
  },
  {
    "id": 513,
    "name": "collaborative_privacy_protocol",
    "type": "concept",
    "description": ""
  },
  {
    "id": 514,
    "name": "isolated_process_container",
    "type": "concept",
    "description": ""
  },
  {
    "id": 515,
    "name": "ing_power_analysis_threatSide_Channel_Attack",
    "type": "concept",
    "description": ""
  },
  {
    "id": 516,
    "name": "Adversarial_Machine_Learning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 517,
    "name": "Federated_Learning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 518,
    "name": "SSL_TLS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 519,
    "name": "Digital_Certificate",
    "type": "concept",
    "description": ""
  },
  {
    "id": 520,
    "name": "Threat_Intelligence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 521,
    "name": "Incident_Response",
    "type": "concept",
    "description": ""
  },
  {
    "id": 522,
    "name": "Penetration_Testing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 523,
    "name": "Vulnerability_Assessment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 524,
    "name": "CRISPR_Cas9",
    "type": "concept",
    "description": ""
  },
  {
    "id": 525,
    "name": "Base_Editing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 526,
    "name": "Prime_Editing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 527,
    "name": "Gene_Therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 528,
    "name": "RNA_Interference",
    "type": "concept",
    "description": ""
  },
  {
    "id": 529,
    "name": "mRNA_Vaccine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 530,
    "name": "Synthetic_Biology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 531,
    "name": "Organoid_Culture",
    "type": "concept",
    "description": ""
  },
  {
    "id": 532,
    "name": "Single_Cell_Sequencing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 533,
    "name": "Epigenome_Modification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 534,
    "name": "Cellular_Reprogramming",
    "type": "concept",
    "description": ""
  },
  {
    "id": 535,
    "name": "Xenotransplantation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 536,
    "name": "Tissue_Engineering",
    "type": "concept",
    "description": ""
  },
  {
    "id": 537,
    "name": "Biomaterials",
    "type": "concept",
    "description": ""
  },
  {
    "id": 538,
    "name": "Biosensors",
    "type": "concept",
    "description": ""
  },
  {
    "id": 539,
    "name": "Proteomics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 540,
    "name": "Metabolomics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 541,
    "name": "Pharmacogenomics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 542,
    "name": "Senolytics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 543,
    "name": "Rocket_Propulsion",
    "type": "concept",
    "description": ""
  },
  {
    "id": 544,
    "name": "Ion_Drive",
    "type": "concept",
    "description": ""
  },
  {
    "id": 545,
    "name": "Reusable_Rocket",
    "type": "concept",
    "description": ""
  },
  {
    "id": 546,
    "name": "Orbital_Mechanics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 547,
    "name": "Gravitational_Well",
    "type": "concept",
    "description": ""
  },
  {
    "id": 548,
    "name": "Lagrange_Point",
    "type": "concept",
    "description": ""
  },
  {
    "id": 549,
    "name": "Space_Debris",
    "type": "concept",
    "description": ""
  },
  {
    "id": 550,
    "name": "Satellite_Constellation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 551,
    "name": "Interplanetary_Transfer",
    "type": "concept",
    "description": ""
  },
  {
    "id": 552,
    "name": "Mars_Habitat",
    "type": "concept",
    "description": ""
  },
  {
    "id": 553,
    "name": "Asteroid_Mining",
    "type": "concept",
    "description": ""
  },
  {
    "id": 554,
    "name": "Solar_Sail",
    "type": "concept",
    "description": ""
  },
  {
    "id": 555,
    "name": "Nuclear_Space_Propulsion",
    "type": "concept",
    "description": ""
  },
  {
    "id": 556,
    "name": "Life_Support_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 557,
    "name": "Radiation_Shielding",
    "type": "concept",
    "description": ""
  },
  {
    "id": 558,
    "name": "Exoplanet_Detection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 559,
    "name": "Astrobiology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 560,
    "name": "Space_Tether",
    "type": "concept",
    "description": ""
  },
  {
    "id": 561,
    "name": "Lunar_Base",
    "type": "concept",
    "description": ""
  },
  {
    "id": 562,
    "name": "Space_Tourism",
    "type": "concept",
    "description": ""
  },
  {
    "id": 563,
    "name": "Fusion_Energy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 564,
    "name": "Fission_Energy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 565,
    "name": "Solid_State_Battery",
    "type": "concept",
    "description": ""
  },
  {
    "id": 566,
    "name": "tim",
    "type": "concept",
    "description": ""
  },
  {
    "id": 567,
    "name": "model_poisoning_attack",
    "type": "concept",
    "description": ""
  },
  {
    "id": 568,
    "name": "decentralized_training_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 569,
    "name": "transport_encryption_standard",
    "type": "concept",
    "description": ""
  },
  {
    "id": 570,
    "name": "identity_verification_credential",
    "type": "concept",
    "description": ""
  },
  {
    "id": 571,
    "name": "attack_prediction_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 572,
    "name": "breach_management_protocol",
    "type": "concept",
    "description": ""
  },
  {
    "id": 573,
    "name": "security_vulnerability_assessment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 574,
    "name": "weakness_identification_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 575,
    "name": "gene_editing_tool",
    "type": "concept",
    "description": ""
  },
  {
    "id": 576,
    "name": "nucleotide_modification_technique",
    "type": "concept",
    "description": ""
  },
  {
    "id": 577,
    "name": "precision_genome_rewrite_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 578,
    "name": "genetic_disease_treatment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 579,
    "name": "gene_silencing_mechanism",
    "type": "concept",
    "description": ""
  },
  {
    "id": 580,
    "name": "protein_instruction_delivery",
    "type": "concept",
    "description": ""
  },
  {
    "id": 581,
    "name": "engineered_living_system_design",
    "type": "concept",
    "description": ""
  },
  {
    "id": 582,
    "name": "mini_organ_growth_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 583,
    "name": "individual_cell_analysis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 584,
    "name": "gene_expression_tagging",
    "type": "concept",
    "description": ""
  },
  {
    "id": 585,
    "name": "cell_type_conversion_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 586,
    "name": "cross_species_organ_transfer",
    "type": "concept",
    "description": ""
  },
  {
    "id": 587,
    "name": "scaffold_based_organ_growth",
    "type": "concept",
    "description": ""
  },
  {
    "id": 588,
    "name": "biocompatible_implant_material",
    "type": "concept",
    "description": ""
  },
  {
    "id": 589,
    "name": "biological_detection_device",
    "type": "concept",
    "description": ""
  },
  {
    "id": 590,
    "name": "protein_structure_study",
    "type": "concept",
    "description": ""
  },
  {
    "id": 591,
    "name": "small_molecule_analysis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 592,
    "name": "drug_response_genetics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 593,
    "name": "aging_cell_clearance_therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 594,
    "name": "space_vehicle_propulsion_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 595,
    "name": "electric_spacecraft_engine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 596,
    "name": "recoverable_launch_vehicle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 597,
    "name": "celestial_motion_physics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 598,
    "name": "planetary_mass_attraction_field",
    "type": "concept",
    "description": ""
  },
  {
    "id": 599,
    "name": "orbital_stability_position",
    "type": "concept",
    "description": ""
  },
  {
    "id": 600,
    "name": "orbital_fragment_hazard",
    "type": "concept",
    "description": ""
  },
  {
    "id": 601,
    "name": "distributed_orbit_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 602,
    "name": "planet_to_planet_trajectory",
    "type": "concept",
    "description": ""
  },
  {
    "id": 603,
    "name": "red_planet_settlement_structure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 604,
    "name": "space_resource_extraction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 605,
    "name": "photon_pressure_propulsion",
    "type": "concept",
    "description": ""
  },
  {
    "id": 606,
    "name": "fission_driven_thrust",
    "type": "concept",
    "description": ""
  },
  {
    "id": 607,
    "name": "closed_ecosystem_maintenance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 608,
    "name": "cosmic_ray_protection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 609,
    "name": "distant_world_discovery_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 610,
    "name": "extraterrestrial_life_research",
    "type": "concept",
    "description": ""
  },
  {
    "id": 611,
    "name": "orbital_momentum_exchange_cable",
    "type": "concept",
    "description": ""
  },
  {
    "id": 612,
    "name": "moon_settlement_facility",
    "type": "concept",
    "description": ""
  },
  {
    "id": 613,
    "name": "commercial_aerospace_travel",
    "type": "concept",
    "description": ""
  },
  {
    "id": 614,
    "name": "nuclear_combination_power_source",
    "type": "concept",
    "description": ""
  },
  {
    "id": 615,
    "name": "nuclear_splitting_power_generation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 616,
    "name": "lithium_battery_evolution",
    "type": "concept",
    "description": ""
  },
  {
    "id": 617,
    "name": "lyte_storageFlow_Battery",
    "type": "concept",
    "description": ""
  },
  {
    "id": 618,
    "name": "Hydrogen_Fuel_Cell",
    "type": "concept",
    "description": ""
  },
  {
    "id": 619,
    "name": "Carbon_Capture",
    "type": "concept",
    "description": ""
  },
  {
    "id": 620,
    "name": "Direct_Air_Capture",
    "type": "concept",
    "description": ""
  },
  {
    "id": 621,
    "name": "Geothermal_Energy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 622,
    "name": "Offshore_Wind",
    "type": "concept",
    "description": ""
  },
  {
    "id": 623,
    "name": "Perovskite_Solar",
    "type": "concept",
    "description": ""
  },
  {
    "id": 624,
    "name": "Grid_Storage",
    "type": "concept",
    "description": ""
  },
  {
    "id": 625,
    "name": "Virtual_Power_Plant",
    "type": "concept",
    "description": ""
  },
  {
    "id": 626,
    "name": "Smart_Grid",
    "type": "concept",
    "description": ""
  },
  {
    "id": 627,
    "name": "Demand_Response",
    "type": "concept",
    "description": ""
  },
  {
    "id": 628,
    "name": "Green_Hydrogen",
    "type": "concept",
    "description": ""
  },
  {
    "id": 629,
    "name": "Ammonia_Fuel",
    "type": "concept",
    "description": ""
  },
  {
    "id": 630,
    "name": "Thermal_Energy_Storage",
    "type": "concept",
    "description": ""
  },
  {
    "id": 631,
    "name": "Wave_Energy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 632,
    "name": "Carbon_Neutrality",
    "type": "concept",
    "description": ""
  },
  {
    "id": 633,
    "name": "Renewable_Energy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 635,
    "name": "AI",
    "type": "concept",
    "description": ""
  },
  {
    "id": 636,
    "name": "Biotechnology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 637,
    "name": "Energy_Systems",
    "type": "concept",
    "description": ""
  },
  {
    "id": 638,
    "name": "Space_Technology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 647,
    "name": "GitHub",
    "type": "concept",
    "description": ""
  },
  {
    "id": 648,
    "name": "Kubernetes",
    "type": "concept",
    "description": ""
  },
  {
    "id": 649,
    "name": "Docker",
    "type": "concept",
    "description": ""
  },
  {
    "id": 650,
    "name": "API",
    "type": "concept",
    "description": ""
  },
  {
    "id": 651,
    "name": "Cloud_Computing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 652,
    "name": "Edge_Computing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 653,
    "name": "5G",
    "type": "concept",
    "description": ""
  },
  {
    "id": 654,
    "name": "IoT",
    "type": "concept",
    "description": ""
  },
  {
    "id": 655,
    "name": "Robotics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 657,
    "name": "Neural_Link",
    "type": "concept",
    "description": ""
  },
  {
    "id": 658,
    "name": "Auto_Learning_Trigger",
    "type": "concept",
    "description": ""
  },
  {
    "id": 659,
    "name": "Continuous_Ingestion",
    "type": "concept",
    "description": ""
  },
  {
    "id": 660,
    "name": "Pattern_Extraction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 661,
    "name": "Cross_Reference_Build",
    "type": "concept",
    "description": ""
  },
  {
    "id": 662,
    "name": "Knowledge_Optimization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 663,
    "name": "Error_Correction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 664,
    "name": "Version_Control",
    "type": "concept",
    "description": ""
  },
  {
    "id": 665,
    "name": "Export_Ready",
    "type": "concept",
    "description": ""
  },
  {
    "id": 666,
    "name": "liquid_electro",
    "type": "concept",
    "description": ""
  },
  {
    "id": 667,
    "name": "chemical_electric_converter",
    "type": "concept",
    "description": ""
  },
  {
    "id": 668,
    "name": "atmospheric_CO2_removal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 669,
    "name": "ambient_carbon_sequestration",
    "type": "concept",
    "description": ""
  },
  {
    "id": 670,
    "name": "earth_heat_utilization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 671,
    "name": "marine_turbine_power",
    "type": "concept",
    "description": ""
  },
  {
    "id": 672,
    "name": "next_generation_photovoltaic",
    "type": "concept",
    "description": ""
  },
  {
    "id": 673,
    "name": "large_scale_electricity_reserve",
    "type": "concept",
    "description": ""
  },
  {
    "id": 674,
    "name": "distributed_energy_aggregate",
    "type": "concept",
    "description": ""
  },
  {
    "id": 675,
    "name": "digital_electric_distribution",
    "type": "concept",
    "description": ""
  },
  {
    "id": 676,
    "name": "consumption_optimization_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 677,
    "name": "renewable_fuel_production",
    "type": "concept",
    "description": ""
  },
  {
    "id": 678,
    "name": "hydrogen_carrier_chemical",
    "type": "concept",
    "description": ""
  },
  {
    "id": 679,
    "name": "heat_retention_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 680,
    "name": "ocean_motion_power_conversion",
    "type": "concept",
    "description": ""
  },
  {
    "id": 681,
    "name": "emission_balance_goal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 682,
    "name": "sustainable_power_source",
    "type": "concept",
    "description": ""
  },
  {
    "id": 683,
    "name": "Cryptography_Breaking",
    "type": "concept",
    "description": ""
  },
  {
    "id": 686,
    "name": "Fusion_Research",
    "type": "concept",
    "description": ""
  },
  {
    "id": 688,
    "name": "Celltex_Regeneration",
    "type": "concept",
    "description": ""
  },
  {
    "id": 689,
    "name": "Lortex_Neural_Pathway",
    "type": "concept",
    "description": ""
  },
  {
    "id": 690,
    "name": "Algorithmic_Trading",
    "type": "concept",
    "description": ""
  },
  {
    "id": 692,
    "name": "Neural_Plasticity",
    "type": "concept",
    "description": ""
  },
  {
    "id": 693,
    "name": "Gene_Editing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 695,
    "name": "Android_Development",
    "type": "concept",
    "description": ""
  },
  {
    "id": 697,
    "name": "Container_Orchestration",
    "type": "concept",
    "description": ""
  },
  {
    "id": 698,
    "name": "Application_Isolation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 699,
    "name": "Software_Communication",
    "type": "concept",
    "description": ""
  },
  {
    "id": 700,
    "name": "Distributed_Systems",
    "type": "concept",
    "description": ""
  },
  {
    "id": 701,
    "name": "Latency_Reduction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 702,
    "name": "Internet_Speed",
    "type": "concept",
    "description": ""
  },
  {
    "id": 703,
    "name": "Device_Network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 704,
    "name": "Automation_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 705,
    "name": "Distributed_Ledger",
    "type": "concept",
    "description": ""
  },
  {
    "id": 706,
    "name": "Brain_Computer_Interface",
    "type": "concept",
    "description": ""
  },
  {
    "id": 707,
    "name": "event_driven_knowledge_update",
    "type": "concept",
    "description": ""
  },
  {
    "id": 708,
    "name": "perpetual_data_absorption",
    "type": "concept",
    "description": ""
  },
  {
    "id": 709,
    "name": "relationship_discovery_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 710,
    "name": "multi_domain_connection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 711,
    "name": "efficiency_improvement_loop",
    "type": "concept",
    "description": ""
  },
  {
    "id": 712,
    "name": "mistake_fixing_mechanism",
    "type": "concept",
    "description": ""
  },
  {
    "id": 713,
    "name": "change_tracking_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 714,
    "name": "transfer_completion_status",
    "type": "concept",
    "description": ""
  },
  {
    "id": 724,
    "name": "Cryogenic_Stem_Cell_Culture",
    "type": "concept",
    "description": ""
  },
  {
    "id": 725,
    "name": "Organoid_Engineering",
    "type": "concept",
    "description": ""
  },
  {
    "id": 726,
    "name": "Single_Cell_RNA_Seq",
    "type": "concept",
    "description": ""
  },
  {
    "id": 727,
    "name": "Spatial_Transcriptomics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 728,
    "name": "Optogenetics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 730,
    "name": "Neuromorphic_Computing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 731,
    "name": "Quantum_Neural_Network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 736,
    "name": "Multi_Tensor_Trading",
    "type": "concept",
    "description": ""
  },
  {
    "id": 738,
    "name": "Market_Making",
    "type": "concept",
    "description": ""
  },
  {
    "id": 739,
    "name": "Derivative_Pricing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 740,
    "name": "Risk_Management",
    "type": "concept",
    "description": ""
  },
  {
    "id": 741,
    "name": "Algorithmic_Portfolio_Optimization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 742,
    "name": "Dark_Pool_Trading",
    "type": "concept",
    "description": ""
  },
  {
    "id": 743,
    "name": "Cross_Asset_Strategy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 744,
    "name": "Volatility_Trading",
    "type": "concept",
    "description": ""
  },
  {
    "id": 745,
    "name": "Quantitative_Analysis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 746,
    "name": "Behavioral_Finance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 747,
    "name": "Macroeconomic_Modeling",
    "type": "concept",
    "description": ""
  },
  {
    "id": 748,
    "name": "Neuroanatomy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 749,
    "name": "Connectomics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 750,
    "name": "Diffusion_MRI",
    "type": "concept",
    "description": ""
  },
  {
    "id": 751,
    "name": "Functional_MRI",
    "type": "concept",
    "description": ""
  },
  {
    "id": 752,
    "name": "Electroencephalography",
    "type": "concept",
    "description": ""
  },
  {
    "id": 753,
    "name": "Magnetoencephalography",
    "type": "concept",
    "description": ""
  },
  {
    "id": 754,
    "name": "Intracranial_EEG",
    "type": "concept",
    "description": ""
  },
  {
    "id": 755,
    "name": "Deep_Brain_Stimulation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 756,
    "name": "Transcranial_Magnetic_Stimulation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 757,
    "name": "Psychopharmacology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 758,
    "name": "Cognitive_Neuroscience",
    "type": "concept",
    "description": ""
  },
  {
    "id": 759,
    "name": "Social_Neuroscience",
    "type": "concept",
    "description": ""
  },
  {
    "id": 760,
    "name": "Developmental_Neuroscience",
    "type": "concept",
    "description": ""
  },
  {
    "id": 761,
    "name": "Computational_Neuroscience",
    "type": "concept",
    "description": ""
  },
  {
    "id": 762,
    "name": "Human_Cerebral_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 764,
    "name": "Thalamic_Relay_Sys",
    "type": "concept",
    "description": ""
  },
  {
    "id": 765,
    "name": "Hypothalamic_Regulatory_Center",
    "type": "concept",
    "description": ""
  },
  {
    "id": 766,
    "name": "Cerebellar_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 767,
    "name": "Brainstem_Reticular_Formation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 768,
    "name": "Hippocampal_Formation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 769,
    "name": "Amygdalar_Complex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 770,
    "name": "Prefrontal_Cortices",
    "type": "concept",
    "description": ""
  },
  {
    "id": 771,
    "name": "Anterior_Cingulate_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 772,
    "name": "Insular_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 773,
    "name": "Occipital_Visual_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 774,
    "name": "Temporal_Auditory_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 775,
    "name": "Parietal_Somatosensory_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 776,
    "name": "Primary_Motor_Cortex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 777,
    "name": "Premotor_Area",
    "type": "concept",
    "description": ""
  },
  {
    "id": 778,
    "name": "Supplementary_Motor_Area",
    "type": "concept",
    "description": ""
  },
  {
    "id": 779,
    "name": "Mirror_Neuron_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 780,
    "name": "Default_Mode_Network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 781,
    "name": "Salience_Network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 782,
    "name": "Central_Executive_Network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 783,
    "name": "Cardiac_Electrophysiology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 784,
    "name": "Echocardiography",
    "type": "concept",
    "description": ""
  },
  {
    "id": 785,
    "name": "Cardiac_MRI",
    "type": "concept",
    "description": ""
  },
  {
    "id": 786,
    "name": "Coronary_Angiography",
    "type": "concept",
    "description": ""
  },
  {
    "id": 796,
    "name": "subzero_preservation_technique",
    "type": "concept",
    "description": ""
  },
  {
    "id": 797,
    "name": "miniature_organ_creation_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 798,
    "name": "individual_cell_genetics_analysis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 799,
    "name": "location_based_gene_mapping",
    "type": "concept",
    "description": ""
  },
  {
    "id": 800,
    "name": "light_controlled_neuron_activation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 801,
    "name": "neural_signal_translation_device",
    "type": "concept",
    "description": ""
  },
  {
    "id": 802,
    "name": "brain-inspired_hardware_design",
    "type": "concept",
    "description": ""
  },
  {
    "id": 803,
    "name": "hybrid_quantum_classical_ai",
    "type": "concept",
    "description": ""
  },
  {
    "id": 804,
    "name": "privacy_preserving_model_training",
    "type": "concept",
    "description": ""
  },
  {
    "id": 805,
    "name": "statistical_anonymization_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 806,
    "name": "encrypted_data_computation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 807,
    "name": "privacy_verification_protocol",
    "type": "concept",
    "description": ""
  },
  {
    "id": 808,
    "name": "algorithmic_portfolio_management",
    "type": "concept",
    "description": ""
  },
  {
    "id": 809,
    "name": "millisecond_execution_strategy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 810,
    "name": "liquidity_provision_activity",
    "type": "concept",
    "description": ""
  },
  {
    "id": 811,
    "name": "financial_contract_valuation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 812,
    "name": "exposure_mitigation_framework",
    "type": "concept",
    "description": ""
  },
  {
    "id": 813,
    "name": "automated_asset_allocation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 814,
    "name": "institutional_private_exchange",
    "type": "concept",
    "description": ""
  },
  {
    "id": 815,
    "name": "multi_market_investment_approach",
    "type": "concept",
    "description": ""
  },
  {
    "id": 816,
    "name": "implied_variance_speculation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 817,
    "name": "mathematical_finance_method",
    "type": "concept",
    "description": ""
  },
  {
    "id": 818,
    "name": "psychological_market_driver_study",
    "type": "concept",
    "description": ""
  },
  {
    "id": 819,
    "name": "economy-wide_simulation_technique",
    "type": "concept",
    "description": ""
  },
  {
    "id": 820,
    "name": "nervous_system_structure_mapping",
    "type": "concept",
    "description": ""
  },
  {
    "id": 821,
    "name": "neural_pathway_reconstruction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 822,
    "name": "white_matter_tract_imaging",
    "type": "concept",
    "description": ""
  },
  {
    "id": 823,
    "name": "brain_activity_localization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 824,
    "name": "electrical_signal_recording",
    "type": "concept",
    "description": ""
  },
  {
    "id": 825,
    "name": "magnetic_field_detection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 826,
    "name": "direct_brain_measurement",
    "type": "concept",
    "description": ""
  },
  {
    "id": 827,
    "name": "implanted_electrode_therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 828,
    "name": "non_invasive_activation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 829,
    "name": "drug_effect_on_mind_study",
    "type": "concept",
    "description": ""
  },
  {
    "id": 830,
    "name": "mental_process_brain_link",
    "type": "concept",
    "description": ""
  },
  {
    "id": 831,
    "name": "group_interaction_brain_study",
    "type": "concept",
    "description": ""
  },
  {
    "id": 832,
    "name": "brain_maturation_tracking",
    "type": "concept",
    "description": ""
  },
  {
    "id": 833,
    "name": "theoretical_brain_modeling",
    "type": "concept",
    "description": ""
  },
  {
    "id": 834,
    "name": "outer_brain_gray_matter",
    "type": "concept",
    "description": ""
  },
  {
    "id": 835,
    "name": "motor_control_nucleus_cluster",
    "type": "concept",
    "description": ""
  },
  {
    "id": 836,
    "name": "sensory_integration_hub",
    "type": "concept",
    "description": ""
  },
  {
    "id": 837,
    "name": "homeostasis_controller",
    "type": "concept",
    "description": ""
  },
  {
    "id": 838,
    "name": "fine_motor_coordinator",
    "type": "concept",
    "description": ""
  },
  {
    "id": 839,
    "name": "arousal_regulation_net",
    "type": "concept",
    "description": ""
  },
  {
    "id": 840,
    "name": "spatial_memory_encoder",
    "type": "concept",
    "description": ""
  },
  {
    "id": 841,
    "name": "threat_detection_center",
    "type": "concept",
    "description": ""
  },
  {
    "id": 842,
    "name": "executive_function_region",
    "type": "concept",
    "description": ""
  },
  {
    "id": 843,
    "name": "conflict_monitoring_area",
    "type": "concept",
    "description": ""
  },
  {
    "id": 844,
    "name": "interoception_processing_zone",
    "type": "concept",
    "description": ""
  },
  {
    "id": 845,
    "name": "primary_sight_processor",
    "type": "concept",
    "description": ""
  },
  {
    "id": 846,
    "name": "sound_recognition_zone",
    "type": "concept",
    "description": ""
  },
  {
    "id": 847,
    "name": "touch_integration_area",
    "type": "concept",
    "description": ""
  },
  {
    "id": 848,
    "name": "voluntary_movement_initiator",
    "type": "concept",
    "description": ""
  },
  {
    "id": 849,
    "name": "action_planning_region",
    "type": "concept",
    "description": ""
  },
  {
    "id": 850,
    "name": "movement_sequence_organizer",
    "type": "concept",
    "description": ""
  },
  {
    "id": 851,
    "name": "observed_action_replication",
    "type": "concept",
    "description": ""
  },
  {
    "id": 852,
    "name": "resting_state_brain_cycle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 853,
    "name": "stimulus_relevance_detector",
    "type": "concept",
    "description": ""
  },
  {
    "id": 854,
    "name": "task_focus_regulator",
    "type": "concept",
    "description": ""
  },
  {
    "id": 855,
    "name": "heart_electric_signal_study",
    "type": "concept",
    "description": ""
  },
  {
    "id": 856,
    "name": "ultrasound_heart_imaging",
    "type": "concept",
    "description": ""
  },
  {
    "id": 857,
    "name": "high_resolution_heart_scan",
    "type": "concept",
    "description": ""
  },
  {
    "id": 858,
    "name": "blood_vessel_visualization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 859,
    "name": "hythmia_diagnostic_testElectrophysiology_Study",
    "type": "concept",
    "description": ""
  },
  {
    "id": 860,
    "name": "Pacemaker_Implantation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 861,
    "name": "Cardioverter_Defibrillator",
    "type": "concept",
    "description": ""
  },
  {
    "id": 862,
    "name": "Transcatheter_Valve_Repair",
    "type": "concept",
    "description": ""
  },
  {
    "id": 863,
    "name": "Mechanical_Circulatory_Support",
    "type": "concept",
    "description": ""
  },
  {
    "id": 864,
    "name": "Heart_Transplant",
    "type": "concept",
    "description": ""
  },
  {
    "id": 865,
    "name": "Ventricular_Assist_Device",
    "type": "concept",
    "description": ""
  },
  {
    "id": 866,
    "name": "Renal_Function_Testing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 867,
    "name": "Dialysis_Membrane_Technology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 868,
    "name": "Kidney_Transplant",
    "type": "concept",
    "description": ""
  },
  {
    "id": 869,
    "name": "Hepatic_Function_Testing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 870,
    "name": "Liver_Transplant",
    "type": "concept",
    "description": ""
  },
  {
    "id": 871,
    "name": "Portal_Hypertension_Management",
    "type": "concept",
    "description": ""
  },
  {
    "id": 872,
    "name": "Intrahepatic_Cholangiogram",
    "type": "concept",
    "description": ""
  },
  {
    "id": 873,
    "name": "Splenic_Function_Testing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 874,
    "name": "Autoimmune_Disease_Diagnosis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 875,
    "name": "Bone_Marrow_Transplant",
    "type": "concept",
    "description": ""
  },
  {
    "id": 876,
    "name": "Immunotherapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 877,
    "name": "CAR_T_Cell_Therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 878,
    "name": "Monoclonal_Antibody_Therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 879,
    "name": "Gene_Delivery_Vector",
    "type": "concept",
    "description": ""
  },
  {
    "id": 880,
    "name": "Lentiviral_Vector",
    "type": "concept",
    "description": ""
  },
  {
    "id": 881,
    "name": "Adenoviral_Vector",
    "type": "concept",
    "description": ""
  },
  {
    "id": 882,
    "name": "AAV_Vector",
    "type": "concept",
    "description": ""
  },
  {
    "id": 883,
    "name": "Lipid_Nanoparticle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 884,
    "name": "mRNA_LNP_Therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 885,
    "name": "Protein_Substitue_Therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 886,
    "name": "Exosome_Therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 887,
    "name": "Organ_On_Chip",
    "type": "concept",
    "description": ""
  },
  {
    "id": 888,
    "name": "3D_Bioprinting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 889,
    "name": "Scaffold_Materials",
    "type": "concept",
    "description": ""
  },
  {
    "id": 890,
    "name": "Growth_Factor_Delivery",
    "type": "concept",
    "description": ""
  },
  {
    "id": 891,
    "name": "Decellularized_Organ",
    "type": "concept",
    "description": ""
  },
  {
    "id": 892,
    "name": "Xenograft_Model",
    "type": "concept",
    "description": ""
  },
  {
    "id": 893,
    "name": "Patient_derived_Xenograft",
    "type": "concept",
    "description": ""
  },
  {
    "id": 894,
    "name": "Organoid_Drug_Screening",
    "type": "concept",
    "description": ""
  },
  {
    "id": 895,
    "name": "CRISPR_Base_Editor",
    "type": "concept",
    "description": ""
  },
  {
    "id": 896,
    "name": "CRISPR_Prime_Editor",
    "type": "concept",
    "description": ""
  },
  {
    "id": 897,
    "name": "CRISPR_Activator",
    "type": "concept",
    "description": ""
  },
  {
    "id": 898,
    "name": "CRISPR_Interference",
    "type": "concept",
    "description": ""
  },
  {
    "id": 899,
    "name": "Epigenome_Editor",
    "type": "concept",
    "description": ""
  },
  {
    "id": 900,
    "name": "Zinc_Finger_Nuclease",
    "type": "concept",
    "description": ""
  },
  {
    "id": 901,
    "name": "TALEN_Gene_Editor",
    "type": "concept",
    "description": ""
  },
  {
    "id": 902,
    "name": "Meganuclease_Editor",
    "type": "concept",
    "description": ""
  },
  {
    "id": 903,
    "name": "Homologous_Recombination",
    "type": "concept",
    "description": ""
  },
  {
    "id": 904,
    "name": "Non_Homologous_End_Joining",
    "type": "concept",
    "description": ""
  },
  {
    "id": 905,
    "name": "Programmable_Nuclease",
    "type": "concept",
    "description": ""
  },
  {
    "id": 906,
    "name": "Ribonucleoprotein_Complex",
    "type": "concept",
    "description": ""
  },
  {
    "id": 907,
    "name": "Guide_RNA_Design",
    "type": "concept",
    "description": ""
  },
  {
    "id": 908,
    "name": "Off_Target_Assay",
    "type": "concept",
    "description": ""
  },
  {
    "id": 909,
    "name": "On_Target_Efficiency",
    "type": "concept",
    "description": ""
  },
  {
    "id": 910,
    "name": "Delivery_Method_Selection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 911,
    "name": "Clinical_Gene_Therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 912,
    "name": "Regulatory_Compliance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 913,
    "name": "Manufacturing_Process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 914,
    "name": "Quality_Control",
    "type": "concept",
    "description": ""
  },
  {
    "id": 915,
    "name": "Stability_Testing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 916,
    "name": "Storage_Condition",
    "type": "concept",
    "description": ""
  },
  {
    "id": 917,
    "name": "Distribution_Cold_Chain",
    "type": "concept",
    "description": ""
  },
  {
    "id": 918,
    "name": "Pharmacovigilance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 919,
    "name": "Post_Marketing_Surveillance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 920,
    "name": "Real_World_Evidence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 921,
    "name": "Digital_Twin",
    "type": "concept",
    "description": ""
  },
  {
    "id": 922,
    "name": "Precision_Medicine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 923,
    "name": "Companion_Diagnostic",
    "type": "concept",
    "description": ""
  },
  {
    "id": 924,
    "name": "Biomarker_Discovery",
    "type": "concept",
    "description": ""
  },
  {
    "id": 925,
    "name": "Pharmacogenomic_Testing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 926,
    "name": "Polygenic_Risk_Score",
    "type": "concept",
    "description": ""
  },
  {
    "id": 927,
    "name": "Whole_Genome_Sequence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 928,
    "name": "Whole_Exome_Sequence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 929,
    "name": "Targeted_Panel_Sequence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 930,
    "name": "arr",
    "type": "concept",
    "description": ""
  },
  {
    "id": 931,
    "name": "rhythm_regulation_device",
    "type": "concept",
    "description": ""
  },
  {
    "id": 932,
    "name": "arrhythmia_shock_therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 933,
    "name": "minimally_invasive_cardiac_fix",
    "type": "concept",
    "description": ""
  },
  {
    "id": 934,
    "name": "artificial_pump_therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 935,
    "name": "donor_organ_replacement",
    "type": "concept",
    "description": ""
  },
  {
    "id": 936,
    "name": "partial_cardiac_support",
    "type": "concept",
    "description": ""
  },
  {
    "id": 937,
    "name": "kidney_performance_evaluation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 938,
    "name": "artificial_filtration_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 940,
    "name": "liver_performance_evaluation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 942,
    "name": "venous_pressure_treatment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 943,
    "name": "bile_duct_visualization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 944,
    "name": "immune_filtration_evaluation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 945,
    "name": "self_attack_detection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 946,
    "name": "hematopoietic_replacement",
    "type": "concept",
    "description": ""
  },
  {
    "id": 947,
    "name": "immune_system_cancer_treatment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 948,
    "name": "engineered_lymphocyte_treatment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 949,
    "name": "targeted_protein_drug",
    "type": "concept",
    "description": ""
  },
  {
    "id": 950,
    "name": "genetic_material_transport",
    "type": "concept",
    "description": ""
  },
  {
    "id": 951,
    "name": "integrating_gene_vehicle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 952,
    "name": "transient_gene_deliverer",
    "type": "concept",
    "description": ""
  },
  {
    "id": 953,
    "name": "safe_gene_therapy_vehicle",
    "type": "concept",
    "description": ""
  },
  {
    "id": 954,
    "name": "non_viral_delivery_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 955,
    "name": "lipid_encased_instructions",
    "type": "concept",
    "description": ""
  },
  {
    "id": 956,
    "name": "enzyme_replacement",
    "type": "concept",
    "description": ""
  },
  {
    "id": 957,
    "name": "extracellular_vehicle_medication",
    "type": "concept",
    "description": ""
  },
  {
    "id": 958,
    "name": "microfluidic_human_tissue_simulator",
    "type": "concept",
    "description": ""
  },
  {
    "id": 959,
    "name": "layered_tissue_construction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 960,
    "name": "structural_growth_guide",
    "type": "concept",
    "description": ""
  },
  {
    "id": 961,
    "name": "signaling_molecule_release",
    "type": "concept",
    "description": ""
  },
  {
    "id": 962,
    "name": "scaffold_preserved_template",
    "type": "concept",
    "description": ""
  },
  {
    "id": 963,
    "name": "animal_human_tissue_combination",
    "type": "concept",
    "description": ""
  },
  {
    "id": 964,
    "name": "personalized_cancer_model",
    "type": "concept",
    "description": ""
  },
  {
    "id": 965,
    "name": "patient_specific_testing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 966,
    "name": "nucleotide_change_tool",
    "type": "concept",
    "description": ""
  },
  {
    "id": 967,
    "name": "precise_sequence_rewrite",
    "type": "concept",
    "description": ""
  },
  {
    "id": 968,
    "name": "gene_expression_increaser",
    "type": "concept",
    "description": ""
  },
  {
    "id": 969,
    "name": "gene_expression_decreaser",
    "type": "concept",
    "description": ""
  },
  {
    "id": 970,
    "name": "chemical_tag_modifier",
    "type": "concept",
    "description": ""
  },
  {
    "id": 971,
    "name": "protein_DNA_editor",
    "type": "concept",
    "description": ""
  },
  {
    "id": 972,
    "name": "customizable_cutting_tool",
    "type": "concept",
    "description": ""
  },
  {
    "id": 973,
    "name": "large_target_modifier",
    "type": "concept",
    "description": ""
  },
  {
    "id": 974,
    "name": "natural_DNA_repair",
    "type": "concept",
    "description": ""
  },
  {
    "id": 975,
    "name": "quick_DNA_fix",
    "type": "concept",
    "description": ""
  },
  {
    "id": 976,
    "name": "target-specific_cutting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 977,
    "name": "protein_RNA_assembly",
    "type": "concept",
    "description": ""
  },
  {
    "id": 978,
    "name": "targeting_sequence_planning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 979,
    "name": "unintended_cut_detection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 980,
    "name": "intended_cut_success",
    "type": "concept",
    "description": ""
  },
  {
    "id": 981,
    "name": "vehicle_choice_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 982,
    "name": "human_patient_application",
    "type": "concept",
    "description": ""
  },
  {
    "id": 983,
    "name": "approval_requirement_following",
    "type": "concept",
    "description": ""
  },
  {
    "id": 984,
    "name": "scalable_production_pipeline",
    "type": "concept",
    "description": ""
  },
  {
    "id": 985,
    "name": "safety_assurance_protocol",
    "type": "concept",
    "description": ""
  },
  {
    "id": 986,
    "name": "longevity_verification_study",
    "type": "concept",
    "description": ""
  },
  {
    "id": 987,
    "name": "preservation_parameter_setting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 988,
    "name": "temperature_sensitive_logistics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 989,
    "name": "adverse_event_monitoring",
    "type": "concept",
    "description": ""
  },
  {
    "id": 990,
    "name": "long_term_safety_tracking",
    "type": "concept",
    "description": ""
  },
  {
    "id": 991,
    "name": "clinical_practice_data_collection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 992,
    "name": "virtual_patient_replica",
    "type": "concept",
    "description": ""
  },
  {
    "id": 993,
    "name": "individualized_treatment_strategy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 994,
    "name": "therapy_selection_test",
    "type": "concept",
    "description": ""
  },
  {
    "id": 995,
    "name": "treatment_predictor_finding",
    "type": "concept",
    "description": ""
  },
  {
    "id": 996,
    "name": "drug_response_prediction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 997,
    "name": "cumulative_genetic_likelihood",
    "type": "concept",
    "description": ""
  },
  {
    "id": 998,
    "name": "complete_DNA_readout",
    "type": "concept",
    "description": ""
  },
  {
    "id": 999,
    "name": "protein_coding_region_read",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1000,
    "name": "selected_gene_read",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1001,
    "name": "ressed_gene_measureRNA_Sequencing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1002,
    "name": "ChIP_Seq",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1003,
    "name": "ATAC_Seq",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1004,
    "name": "HiC_Sequence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1005,
    "name": "Methylation_Array",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1006,
    "name": "Proteomics_Mass_Spectrometry",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1007,
    "name": "Metabolomics_Profile",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1008,
    "name": "Lipidomics_Profile",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1009,
    "name": "Glycomics_Profile",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1010,
    "name": "Microbiome_Sequence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1011,
    "name": "Metagenomic_Sequence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1012,
    "name": "Single_Cell_ATAC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1013,
    "name": "Single_Cell_Methylation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1014,
    "name": "Multi_Omic_Integration",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1015,
    "name": "Network_Pharmacology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1016,
    "name": "Systems_Biology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1017,
    "name": "Synthetic_Lethality",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1018,
    "name": "Synthetic_Biology_Circuit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1019,
    "name": "Biosafety_Level",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1020,
    "name": "Bioethics_Compliance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1021,
    "name": "Gain_of_Function",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1022,
    "name": "Pathogen_Surveillance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1023,
    "name": "Antimicrobial_Resistance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1024,
    "name": "Global_Biosecurity",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1025,
    "name": "Pandemic_Preparedness",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1026,
    "name": "Vaccine_Development",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1027,
    "name": "Viral_Vector_Vaccine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1028,
    "name": "DNA_Vaccine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1029,
    "name": "Protein_Subunit_Vaccine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1030,
    "name": "mRNA_Vaccine_Development",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1031,
    "name": "Adjuvant_Enhancement",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1032,
    "name": "Clinical_Trial_Phase",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1033,
    "name": "Phase_I_Trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1034,
    "name": "Phase_II_Trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1035,
    "name": "Phase_III_Trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1036,
    "name": "Phase_IV_Trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1037,
    "name": "Adaptive_Trial_Design",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1038,
    "name": "Basket_Trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1039,
    "name": "Umbrella_Trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1040,
    "name": "Platform_Trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1041,
    "name": "Master_Protocol",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1042,
    "name": "Bayesian_Trial_Design",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1043,
    "name": "Response_Adaptive_Randomization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1044,
    "name": "Seamless_Phase_Trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1045,
    "name": "Orphan_Drug_Designation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1046,
    "name": "Fast_Track_Designation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1047,
    "name": "Breakthrough_Therapy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1048,
    "name": "Priority_Review",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1049,
    "name": "Accelerated_Approval",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1050,
    "name": "Rolling_Review",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1051,
    "name": "Real_Time_Oversight",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1052,
    "name": "Community_Clinical_Trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1053,
    "name": "Decentralized_Trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1054,
    "name": "Hybrid_Trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1055,
    "name": "Direct_to_Patient",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1056,
    "name": "Remote_Patient_Monitoring",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1057,
    "name": "Telemedicine_Platform",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1058,
    "name": "Electronic_Proton_Outcome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1059,
    "name": "Patient_Registry",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1060,
    "name": "HL7_Standard",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1061,
    "name": "DICOM_Standard",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1062,
    "name": "SNOMED_CT",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1063,
    "name": "LOINC_Code",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1064,
    "name": "ICD_Code",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1065,
    "name": "CPT_Code",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1066,
    "name": "RxNorm_Standard",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1067,
    "name": "Drugbank_Entry",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1068,
    "name": "PubChem",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1069,
    "name": "UniProt",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1070,
    "name": "GenBank",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1071,
    "name": "exp",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1072,
    "name": "protein_DNA_binding_map",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1073,
    "name": "chromatin_accessibility_measure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1074,
    "name": "three_dimensional_genome_structure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1075,
    "name": "epigenetic_mark_profile",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1076,
    "name": "protein_identity_measure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1077,
    "name": "small_molecule_snapshot",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1078,
    "name": "fat_molecule_inventory",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1079,
    "name": "sugar_structure_catalog",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1080,
    "name": "gut_flora_genetics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1081,
    "name": "environmental_DNA_mix",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1082,
    "name": "individual_cell_chromatin_state",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1083,
    "name": "individual_cell_epigenome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1084,
    "name": "combined_data_analysis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1085,
    "name": "system_wide_drug_action",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1086,
    "name": "holistic_living_system_model",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1087,
    "name": "dual_gene_cancer_kill",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1088,
    "name": "engineered_genetic_logic",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1089,
    "name": "containment_risk_category",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1090,
    "name": "moral_guideline_adherence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1091,
    "name": "enhanced_pathogen_capability",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1092,
    "name": "disease_agent_monitoring",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1093,
    "name": "drug_resistance_evolution",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1094,
    "name": "worldwide_threat_prevention",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1095,
    "name": "outbreak_response_planning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1096,
    "name": "immunization_product_creation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1097,
    "name": "virus_carrier_immunization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1098,
    "name": "plasmid_instruction_vaccination",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1099,
    "name": "purified_piece_immunization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1100,
    "name": "instruction_RNA_immunization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1101,
    "name": "immune_response_booster",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1102,
    "name": "safety_efficacy_progression",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1103,
    "name": "initial_safety_test",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1104,
    "name": "preliminary_efficacy_test",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1105,
    "name": "confirmation_large_study",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1106,
    "name": "post_approval_surveillance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1107,
    "name": "flexible_protocol_modification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1108,
    "name": "multiple_indication_single_drug_test",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1109,
    "name": "single_indication_multiple_drug_test",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1110,
    "name": "permanent_infrastructure_trial",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1111,
    "name": "overarching_trial_framework",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1112,
    "name": "probability_based_modification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1113,
    "name": "outcome_based_assignment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1114,
    "name": "merged_stage_experiment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1115,
    "name": "rare_disease_benefit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1116,
    "name": "accelerated_review_status",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1117,
    "name": "significant_improvement_claim",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1118,
    "name": "expedited_approval_timeline",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1119,
    "name": "surrogate_endpoint_basis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1120,
    "name": "submission_segment_processing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1121,
    "name": "live_safety_monitoring",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1122,
    "name": "decentralized_participant_study",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1123,
    "name": "remote_data_collection_study",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1124,
    "name": "combined_site_remote_approach",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1125,
    "name": "participant_home_delivery",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1126,
    "name": "offsite_vital_tracking",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1127,
    "name": "virtual_consultation_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1128,
    "name": "digital_patient_report",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1129,
    "name": "condition_specific_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1130,
    "name": "medical_message_standard",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1131,
    "name": "imaging_data_format",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1132,
    "name": "clinical_terminology_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1133,
    "name": "lab_test_identifier",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1134,
    "name": "diagnosis_classification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1135,
    "name": "medical_procedure_code",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1136,
    "name": "medication_normalization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1137,
    "name": "pharmaceutical_database_record",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1138,
    "name": "is chemical_structure_repository",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1139,
    "name": "is protein_sequence_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1140,
    "name": "is nucleotide_sequence_archive",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1141,
    "name": "MIM",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1142,
    "name": "ClinVar",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1143,
    "name": "GWAS_Catalog",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1144,
    "name": "TCGA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1145,
    "name": "ICGC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1146,
    "name": "GTEx",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1147,
    "name": "ENCODE",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1148,
    "name": "Roadmap_Epigenomics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1149,
    "name": "Human_Cell_Atlas",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1150,
    "name": "Human_Proteome_Project",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1151,
    "name": "All_of_Us",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1152,
    "name": "FinnGen",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1153,
    "name": "Estonian_PMC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1154,
    "name": "Icelandic_Decode",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1155,
    "name": "Korea_Biobank",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1156,
    "name": "Singapore_Genome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1157,
    "name": "African_Genome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1158,
    "name": "Equity_Focused_Genomics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1159,
    "name": "Data_Governance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1160,
    "name": "Consent_Management",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1161,
    "name": "Privacy_Preservation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1162,
    "name": "Security_Compliance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1163,
    "name": "Ethics_Review",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1164,
    "name": "IRB_Oversight",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1165,
    "name": "REC_Oversight",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1166,
    "name": "DSMB_Oversight",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1167,
    "name": "Independent_Committee",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1168,
    "name": "Safety_Reporting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1169,
    "name": "Signal_Detection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1170,
    "name": "Benefit_Risk_Assessment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1171,
    "name": "Post_Marketing_Safety",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1172,
    "name": "Risk_Minimization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1173,
    "name": "Pharmacovigilance_Planning",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1174,
    "name": "Risk_Management_Plan",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1175,
    "name": "REMS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1176,
    "name": "EU_RMP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1177,
    "name": "Safety_Update",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1178,
    "name": "Aggregate_Report",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1179,
    "name": "Signal_Evaluation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1180,
    "name": "Case_Investigation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1181,
    "name": "Causality_Assessment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1182,
    "name": "Dechallenge_Rechallenge",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1183,
    "name": "Literature_Surveillance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1184,
    "name": "Social_Media_Monitoring",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1185,
    "name": "Spontaneous_Reporting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1186,
    "name": "Consumer_Reporting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1187,
    "name": "Mandatory_Reporting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1188,
    "name": "Expedited_Reporting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1189,
    "name": "Periodic_Report",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1190,
    "name": "Annual_Report",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1191,
    "name": "Development_Safety_Report",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1192,
    "name": "RSI",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1193,
    "name": "ICAR",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1194,
    "name": "SAR",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1195,
    "name": "SUSAR",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1196,
    "name": "SAE",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1197,
    "name": "AESI",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1198,
    "name": "MedDRA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1199,
    "name": "FAERS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1200,
    "name": "EudraVigilance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1201,
    "name": "VigiBase",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1202,
    "name": "Argus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1203,
    "name": "ArisG",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1204,
    "name": "Safety_Data_Share",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1205,
    "name": "Global_Safety_Infrastructure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1206,
    "name": "Local_Safety_Team",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1207,
    "name": "Vendor_Management",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1208,
    "name": "Audit_Quality",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1209,
    "name": "Training_Competency",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1210,
    "name": "Documentation_Archive",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1211,
    "name": "is Mendelian_disorder_catalogO",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1212,
    "name": "is clinical_variant_submission",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1213,
    "name": "trait_association_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1214,
    "name": "is cancer_genome_atlas",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1215,
    "name": "is international_cancer_genome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1216,
    "name": "is tissue_expression_reference",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1217,
    "name": "is regulatory_element_map",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1218,
    "name": "cell_type_epigenome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1219,
    "name": "comprehensive_cell_types",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1220,
    "name": "complete_protein_inventory",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1221,
    "name": "diverse_population_genomic_cohort",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1222,
    "name": "is Finnish_population_genetics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1223,
    "name": "national_genetic_registry",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1224,
    "name": "population_specific_biobank",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1225,
    "name": "Korean_population_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1226,
    "name": "Southeast_Asian_genomics",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1227,
    "name": "continental_diversity_project",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1228,
    "name": "underserved_community_study",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1229,
    "name": "information_management_policy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1230,
    "name": "participant_permission_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1231,
    "name": "identity_protection_mechanism",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1232,
    "name": "cybersecurity_standard_adherence",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1233,
    "name": "institutional_approval_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1234,
    "name": "institutional_review_board",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1235,
    "name": "research_ethics_committee",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1236,
    "name": "data_safety_monitoring",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1237,
    "name": "blinded_evaluation_panel",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1238,
    "name": "adverse_event_documentation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1239,
    "name": "pattern_identification_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1240,
    "name": "therapeutic_value_judgment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1241,
    "name": "commercial_use_monitoring",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1242,
    "name": "harm_reduction_strategy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1243,
    "name": "safety_management_strategy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1244,
    "name": "mitigation_protocol_document",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1245,
    "name": "risk_evaluation_mitigation_strategy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1246,
    "name": "European_risk_management_plan",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1247,
    "name": "periodic_safety_report",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1248,
    "name": "comprehensive_safety_summary",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1249,
    "name": "hypothesis_confirmation_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1250,
    "name": "individual_event_analysis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1251,
    "name": "cause_relationship_determination",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1252,
    "name": "withdrawal_redosing_test",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1253,
    "name": "published_case_monitoring",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1254,
    "name": "public_discourse_tracking",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1255,
    "name": "voluntary_adverse_event_submission",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1256,
    "name": "patient_direct_feedback",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1257,
    "name": "required_adverse_event_filing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1258,
    "name": "urgent_safety_notification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1259,
    "name": "scheduled_safety_summary",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1260,
    "name": "yearly_safety_aggregate",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1261,
    "name": "pre_marketing_summary",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1262,
    "name": "risk_significance_index",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1263,
    "name": "individual_case_assessment_request",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1264,
    "name": "suspected_adverse_reaction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1265,
    "name": "suspected_unexpected_serious_adverse_reaction",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1266,
    "name": "serious_adverse_event",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1267,
    "name": "area_of_special_interest",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1268,
    "name": "medical_dictionary_for_regulatory_activities",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1269,
    "name": "FDA_adverse_event_reporting_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1270,
    "name": "European_agency_vigilance_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1271,
    "name": "UMC_global_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1272,
    "name": "Oracle_safety_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1273,
    "name": "IBM_safety_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1274,
    "name": "regulatory_information_exchange",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1275,
    "name": "worldwide_vigilance_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1276,
    "name": "regional_monitoring_unit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1277,
    "name": "third_party_service_oversight",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1278,
    "name": "vendor_compliance_verification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1279,
    "name": "staff_capability_assurance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1280,
    "name": "record_retention_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1281,
    "name": "s",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1282,
    "name": "Disaster_Recovery",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1283,
    "name": "Business_Impact_Analysis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1284,
    "name": "Continuity_Strategy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1285,
    "name": "Crisis_Communication",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1286,
    "name": "Stakeholder_Notification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1287,
    "name": "Regulatory_Submission",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1288,
    "name": "Inspection_Readiness",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1289,
    "name": "Compliance_Audit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1290,
    "name": "Deviation_Management",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1291,
    "name": "CAPA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1292,
    "name": "Quality_Target",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1293,
    "name": "Metric_Tracking",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1294,
    "name": "Dashboard_Reporting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1295,
    "name": "Executive_Summary",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1296,
    "name": "Technical_Specification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1297,
    "name": "User_Requirement",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1298,
    "name": "Validation_Protocol",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1299,
    "name": "Installation_Qualification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1300,
    "name": "Operational_Qualification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1301,
    "name": "Performance_Qualification",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1302,
    "name": "Revalidation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1303,
    "name": "Change_Control",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1304,
    "name": "Configuration_Management",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1306,
    "name": "Data_Integrity",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1307,
    "name": "ALCOA_Plus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1308,
    "name": "GCP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1309,
    "name": "GLP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1310,
    "name": "GMP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1311,
    "name": "GDP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1312,
    "name": "GVP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1313,
    "name": "ISO_Standard",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1314,
    "name": "ICH_Guideline",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1315,
    "name": "FDA_Regulation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1316,
    "name": "EMA_Guideline",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1317,
    "name": "PMDA_Guideline",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1318,
    "name": "NMPA_Standard",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1319,
    "name": "SwissMedic",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1320,
    "name": "Therapeutic_Goods_Administration",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1321,
    "name": "TGA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1322,
    "name": "COFEPRIS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1323,
    "name": "PQ",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1324,
    "name": "RA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1325,
    "name": "QA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1326,
    "name": "QC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1327,
    "name": "QP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1328,
    "name": "PV",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1329,
    "name": "CMC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1330,
    "name": "CTD",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1331,
    "name": "eCTD",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1332,
    "name": "NDA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1333,
    "name": "BLA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1334,
    "name": "IND",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1335,
    "name": "ANDA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1336,
    "name": "505b2",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1337,
    "name": "MA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1338,
    "name": "MAA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1339,
    "name": "DPA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1340,
    "name": "PAS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1341,
    "name": "CBE",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1342,
    "name": "SUPAC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1343,
    "name": "PAR",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1344,
    "name": "PASub",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1345,
    "name": "Variations",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1346,
    "name": "Type_IA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1347,
    "name": "Type_IB",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1348,
    "name": "Type_II",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1349,
    "name": "Type_III",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1350,
    "name": "Grouping",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1351,
    "name": "Work_Sharing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1352,
    "name": "Mutual_Recognition",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1353,
    "name": "i",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1354,
    "name": "business_continuity_plan",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1355,
    "name": "operational_risk_assessment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1356,
    "name": "interruption_management_approach",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1357,
    "name": "emergency_information_release",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1358,
    "name": "interested_party_alert",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1359,
    "name": "authority_formal_request",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1360,
    "name": "audit_preparation_status",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1361,
    "name": "regulation_verification_examination",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1362,
    "name": "protocol_departure_handling",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1363,
    "name": "corrective_preventive_action",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1364,
    "name": "performance_goal_definition",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1365,
    "name": "measurement_progress_monitoring",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1366,
    "name": "visual_status_display",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1367,
    "name": "leadership_overview_document",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1368,
    "name": "detailed_implementation_guide",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1369,
    "name": "functional_need_statement",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1370,
    "name": "qualification_test_document",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1371,
    "name": "setup_verification_test",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1372,
    "name": "functionality_confirmation_test",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1373,
    "name": "capacity_verification_test",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1374,
    "name": "periodic_verification_repeat",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1375,
    "name": "modification_approval_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1376,
    "name": "setting_tracking_system",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1377,
    "name": "revision_tracking_methodology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1378,
    "name": "information_accuracy_completeness",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1379,
    "name": "attributable_legible Contemporaneous_original_accurate_plus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1380,
    "name": "good_clinical_practice",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1381,
    "name": "good_laboratory_practice",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1382,
    "name": "good_manufacturing_practice",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1383,
    "name": "good_distribution_practice",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1384,
    "name": "good_pharmacovigilance_practice",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1385,
    "name": "international_organizations_standard",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1386,
    "name": "harmonisation_international_conference guideline",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1387,
    "name": "food_drug_administration rule",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1388,
    "name": "European_medicines_agency recommendation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1389,
    "name": "pharmaceutical_medical_devices administration japan",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1390,
    "name": "national_medicine_administration china requirement",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1391,
    "name": "swiss_agency_for_therapeutic_products",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1392,
    "name": "australian_regulatory_body",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1393,
    "name": "therapeutics_governance_authority",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1394,
    "name": "mexican_sanitary_authority",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1395,
    "name": "prequalification_unit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1396,
    "name": "regulatory_affairs",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1397,
    "name": "quality_assurance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1398,
    "name": "quality_control",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1399,
    "name": "qualified_person",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1400,
    "name": "pharmacovigilance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1401,
    "name": "chemistry_manufacturing_controls",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1402,
    "name": "common_technical_document",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1403,
    "name": "electronic_common_technical_document",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1404,
    "name": "new_drug_application",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1405,
    "name": "biologics_license_application",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1406,
    "name": "investigational_new_drug",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1407,
    "name": "abbreviated_new_drug_application",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1408,
    "name": "hybrid_new_drug_application",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1409,
    "name": "marketing_authorization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1410,
    "name": "marketing_authorization_application",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1411,
    "name": "delegated_packaging_authorization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1412,
    "name": "post_approval_supplement",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1413,
    "name": "changes_being_effected",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1414,
    "name": "scale_up_post_approval_changes",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1415,
    "name": "post_authorization_supplementary_application",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1416,
    "name": "post_authorization_submitted",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1417,
    "name": "marketing_authorization_modifications",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1418,
    "name": "minor_variation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1419,
    "name": "moderate_variation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1420,
    "name": "major_variation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1421,
    "name": "significant_variation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1422,
    "name": "variation_bundling",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1423,
    "name": "concurrent_regulatory_assessment",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1424,
    "name": "authorization_reciprocity",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1425,
    "name": "viewDecentralized_Procedure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1426,
    "name": "Centralized_Procedure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1427,
    "name": "National_Procedure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1428,
    "name": "Referral_Procedure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1429,
    "name": "Article_20",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1430,
    "name": "Article_30",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1431,
    "name": "Article_31",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1432,
    "name": "Article_38",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1433,
    "name": "Pediatric_Investigation_Plan",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1434,
    "name": "Pediatric_Use_Marketing_Authorization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1435,
    "name": "Orphan_Designation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1436,
    "name": "Compassionate_Use",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1437,
    "name": "Named_Patient_Program",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1438,
    "name": "Early_Access",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1439,
    "name": "Accelerated_Pathway",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1440,
    "name": "Conditional_Authorization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1441,
    "name": "Exceptional_Circumstances",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1442,
    "name": "Hybrid_Application",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1443,
    "name": "Scientific_Advice",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1444,
    "name": "Protocol_Assistance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1445,
    "name": "Interaction_Meeting",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1446,
    "name": "Q&A_Session",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1447,
    "name": "Public_Hearing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1448,
    "name": "Expert_Advisory_Group",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1449,
    "name": "Scientific_Committee",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1450,
    "name": "PRAC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1451,
    "name": "CHMP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1452,
    "name": "CAT",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1453,
    "name": "PDCO",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1454,
    "name": "HMPC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1455,
    "name": "CMWP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1456,
    "name": "RLA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1457,
    "name": "CMDh",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1458,
    "name": "Cochrane",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1459,
    "name": "GRADE",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1460,
    "name": "HAS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1461,
    "name": "GBA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1462,
    "name": "PBAC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1463,
    "name": "MSAC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1464,
    "name": "NZ_PHARMACOL",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1465,
    "name": "SMC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1466,
    "name": "AWMSG",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1467,
    "name": "CAMHT",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1468,
    "name": "RPS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1469,
    "name": "BNF",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1470,
    "name": "ESC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1471,
    "name": "EACTS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1472,
    "name": "ACC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1473,
    "name": "AHA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1474,
    "name": "ESC_EACTS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1475,
    "name": "ACC_AHA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1476,
    "name": "ISHLT",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1477,
    "name": "UNOS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1478,
    "name": "OPTN",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1479,
    "name": "SRTR",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1480,
    "name": "IPAD",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1481,
    "name": "JACC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1482,
    "name": "Circulation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1483,
    "name": "NEJM",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1484,
    "name": "Lancet",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1485,
    "name": "JAMA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1486,
    "name": "BMJ",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1487,
    "name": "Nature",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1488,
    "name": "Science",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1489,
    "name": "Cell",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1490,
    "name": "PubMed",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1491,
    "name": "MEDLINE",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1492,
    "name": "Embase",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1493,
    "name": "Scopus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1494,
    "name": "Web_of_Science",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1495,
    "name": "Google_Scholar",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1496,
    "name": "Semantic_Scholar",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1497,
    "name": "ResearchGate",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1498,
    "name": "Academia_Edu",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1499,
    "name": "bioRxiv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1500,
    "name": "SSRN",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1501,
    "name": "arXiv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1502,
    "name": "multi_country_synced_re",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1503,
    "name": "single_unionwide_evaluation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1504,
    "name": "single_country_approval",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1505,
    "name": "arbitration_dispute_resolution",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1506,
    "name": "european_agency_referral_process",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1507,
    "name": "european_mutual_recognition_dispute",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1508,
    "name": "european_pharmacovigilance_referral",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1509,
    "name": "european_pediatric_referral",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1510,
    "name": "children_study_protocol",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1511,
    "name": "offlabel_child_permitted_status",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1512,
    "name": "rare_disease_status",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1513,
    "name": "pre_approval_patient_access",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1514,
    "name": "individual_patient_supply",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1515,
    "name": "expanded_use_pre_approval",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1516,
    "name": "expedited_development_route",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1517,
    "name": "restricted_approval_basis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1518,
    "name": "limited_information_approval",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1519,
    "name": "mixed_data_submission",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1520,
    "name": "regulatory_guidance_request",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1521,
    "name": "trial_design_recommendation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1522,
    "name": "stakeholder_discussion_session",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1523,
    "name": "clarification_exchange_opportunity",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1524,
    "name": "community_input_forum",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1525,
    "name": "specialist_recommendation_panel",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1526,
    "name": "evaluation_body",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1527,
    "name": "pharmacovigilance_risk_assessment_committee",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1528,
    "name": "committee_for_medicinal_products_for_human_use",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1529,
    "name": "committee_for_advances_technologies",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1530,
    "name": "pediatric_committee",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1531,
    "name": "herbal_medicinal_products_committee",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1532,
    "name": "coordination_group_for_major_expert",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1533,
    "name": "regulatory_leaders_group",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1534,
    "name": "coordination_group_for_medical_devices",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1535,
    "name": "systematic_review_organization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1536,
    "name": "grading_of_recommendations_assessment_development_evaluation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1537,
    "name": "haute_authorite_de_sante",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1538,
    "name": "gemeinsamer_ausschuss_bundesarzt_kassen",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1539,
    "name": "pharmaceutical_benefits_advisory_committee",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1540,
    "name": "medical_services_advisory_committee",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1541,
    "name": "new_zealand_pharmacology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1542,
    "name": "scottish_medicines_consortium",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1543,
    "name": "all_wales_medicines_strategic_group",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1544,
    "name": "cancer_alliance_medicines_healing_team",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1545,
    "name": "royal_pharmaceutical_society",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1546,
    "name": "british_national_formulary",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1547,
    "name": "european_society_of_cardiology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1548,
    "name": "european_association_for cardio thoracic_surgery",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1549,
    "name": "american_college_of_cardiology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1550,
    "name": "american_heart_association",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1551,
    "name": "joint_european_guideline",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1552,
    "name": "joint_american_guideline",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1553,
    "name": "international_society_for_heart_lung_transplantation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1554,
    "name": "united_network_for_organ_sharing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1555,
    "name": "organ_procurement_transplantation_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1556,
    "name": "scientific_registry_transplant_recipients",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1557,
    "name": "international_peer_review",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1558,
    "name": "journal_american_college_cardiology",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1559,
    "name": "american_heart_association_journal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1560,
    "name": "new_england_journal_medicine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1561,
    "name": "prestigious_medical_journal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1562,
    "name": "journal_american_medical_association",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1563,
    "name": "british_medical_journal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1564,
    "name": "multidisciplinary_science_journal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1565,
    "name": "multidisciplinary_research_journal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1566,
    "name": "life_sciences_journal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1567,
    "name": "biomedical_literature_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1568,
    "name": "medical_line_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1569,
    "name": "biomedical_pharmacological_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1570,
    "name": "abstract_citation_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1571,
    "name": "citation_indexing_service",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1572,
    "name": "academic_search_engine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1573,
    "name": "AI_litature_search",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1574,
    "name": "researcher_social_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1575,
    "name": "scholarly_paper_sharing",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1576,
    "name": "preprint_server",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1577,
    "name": "social_sciences_research_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1578,
    "name": "physics_mathematics_cs_preprints",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1579,
    "name": "n_access_repositoryZenodo",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1580,
    "name": "Figshare",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1581,
    "name": "Dryad",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1582,
    "name": "OSF",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1583,
    "name": "Open_Neon",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1584,
    "name": "dbGaP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1585,
    "name": "EGA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1586,
    "name": "IGSR",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1587,
    "name": "1000_Genomes",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1588,
    "name": "gnomAD",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1589,
    "name": "ExAC",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1590,
    "name": "TOPMED",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1591,
    "name": "BRAIN",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1592,
    "name": "HBP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1593,
    "name": "Blue_Brain",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1594,
    "name": "Allen_Brain_Map",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1595,
    "name": "Human_Brain",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1596,
    "name": "BraTS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1597,
    "name": "ADNI",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1598,
    "name": "UKDementia",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1599,
    "name": "NIA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1600,
    "name": "AFSP",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1601,
    "name": "Michael_J_Fox",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1602,
    "name": "Cure_Alzheimer",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1603,
    "name": "Alzheimer_Association",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1604,
    "name": "Dementia_Alliance",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1605,
    "name": "Lewy_Body",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1606,
    "name": "Frontotemporal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1607,
    "name": "Vascular_Dementia",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1608,
    "name": "Normal_Pressure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1609,
    "name": "Creutzfeldt_Jakob",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1610,
    "name": "Progressive_Supranuclear",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1611,
    "name": "Cortical_Basal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1612,
    "name": "Multiple_System",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1613,
    "name": "Parkinson_Disease",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1614,
    "name": "Essential_Tremor",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1615,
    "name": "Huntington",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1616,
    "name": "ALS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1617,
    "name": "SMA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1618,
    "name": "Muscular_Dystrophy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1619,
    "name": "Myasthenia_Graavis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1620,
    "name": "Lambert_Eaton",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1621,
    "name": "Botulism",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1622,
    "name": "Tetanus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1623,
    "name": "Polio",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1624,
    "name": "West_Nile",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1625,
    "name": "Zika",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1626,
    "name": "Dengue",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1627,
    "name": "Chikungunya",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1628,
    "name": "Yellow_Fever",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1629,
    "name": "Japanese_Encephalitis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1630,
    "name": "Tick_Borne_Encephalitis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1631,
    "name": "Rabies",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1632,
    "name": "Mpox",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1633,
    "name": "Monkeypox",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1634,
    "name": "Ebola",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1635,
    "name": "Marburg",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1636,
    "name": "Lassa",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1637,
    "name": "Crimean_Congo",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1638,
    "name": "Hantavirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1639,
    "name": "Nipah",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1640,
    "name": "Hendra",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1641,
    "name": "SARS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1642,
    "name": "MERS",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1643,
    "name": "COVID",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1644,
    "name": "Influenza",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1645,
    "name": "RSV",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1646,
    "name": "Rhinovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1647,
    "name": "Coronavirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1648,
    "name": "Paramyxovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1649,
    "name": "Orthomyxovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1650,
    "name": "Bunyavirales",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1651,
    "name": "Arenaviridae",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1652,
    "name": "Filoviridae",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1653,
    "name": "Rhabdoviridae",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1654,
    "name": "Bornaviridae",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1655,
    "name": "Pneumoviridae",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1656,
    "name": "Metapneumovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1657,
    "name": "Paramyxovirinae",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1658,
    "name": "Morbillivirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1659,
    "name": "Respirovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1660,
    "name": "Rubulaviridae",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1661,
    "name": "Henipavirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1662,
    "name": "ope",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1663,
    "name": "data_sharing_platform",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1664,
    "name": "data_publication_service",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1665,
    "name": "open_science_framework",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1666,
    "name": "neuroscience_data_portal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1667,
    "name": "database_genotypes_phenotypes",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1668,
    "name": "european_genome_phenome_archive",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1669,
    "name": "international_genome_sample_resource",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1670,
    "name": "human_genetic_variation_project",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1671,
    "name": "genome_aggregation_database",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1672,
    "name": "exome_aggregation_consortium",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1673,
    "name": "trans_omic_precision_medicine",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1674,
    "name": "biological_research_advances_innovation_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1675,
    "name": "human_brain_project",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1676,
    "name": "computational_brain_simulation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1677,
    "name": "neuroscience_resource",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1678,
    "name": "is comprehensive_neural_mapping",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1679,
    "name": "brain_tumor_segmentation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1680,
    "name": "alzheimer_disease_neuroimaging_initiative",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1681,
    "name": "university_king_dementia_registry",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1682,
    "name": "national_institute_aging",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1683,
    "name": "american_foundation_suicide_prevention",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1684,
    "name": "Parkinson_research_foundation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1685,
    "name": "dementia_treatment_nonprofit",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1686,
    "name": "memory_loss_advocacy_org",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1687,
    "name": "cognitive_decline_support_network",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1688,
    "name": "dementia_variant_organization",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1689,
    "name": "frontal_temporal_lobe_dementia_group",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1690,
    "name": "blood_flow_brain_impairment_org",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1691,
    "name": "hydrocephalus_dementia_type",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1692,
    "name": "prion_disease_support",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1693,
    "name": "palsy_richardson_stewart_syndrome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1694,
    "name": "degeneration_paralysis_combo",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1695,
    "name": "atrophy_autonomic_failure",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1696,
    "name": "dopamine_deficit_disorder",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1697,
    "name": "involuntary_shaking_condition",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1698,
    "name": "inherited_movement_disorder",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1699,
    "name": "amyotrophic_lateral_sclerosis_motor_neuron",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1700,
    "name": "spinal_muscular_atrophy",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1701,
    "name": "muscle_wasting_disorder_group",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1702,
    "name": "neuromuscular_autoimmune_condition",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1703,
    "name": "paraneoplastic_neuromuscular_syndrome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1704,
    "name": "toxin_medicine paralysis",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1705,
    "name": "bacterial_nerve_toxin_disease",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1706,
    "name": "viral_paralytic_infection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1707,
    "name": "mosquito_borne_viral_illness",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1708,
    "name": "mosquito_transmitted_birth_defect_virus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1709,
    "name": "tropical_fever_bleeding_disease",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1710,
    "name": "joint_pain_arbovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1711,
    "name": "hepatic_viral_hemorrhagic",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1712,
    "name": "asian_brain_inflammation",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1713,
    "name": "european_viral_brain_disease",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1714,
    "name": "fatal_zoonotic_virus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1715,
    "name": "orthopoxviral_skin_lesion",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1716,
    "name": "re_emerging_smallpox_relative",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1717,
    "name": "filovirus_hemorrhagic_fever",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1718,
    "name": "filovirus_severe_bleeding",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1719,
    "name": "arenavirus_west_african_illness",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1720,
    "name": "tick_borne_hemorrhagic",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1721,
    "name": "rodent_borne_pulmonary_syndrome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1722,
    "name": "paramyxoviral_respiratory_neurologic",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1723,
    "name": "equine_paramyxovirus_human_spillover",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1724,
    "name": "severe_acute_respiratory_syndrome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1725,
    "name": "middle_east_respiratory_syndrome",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1726,
    "name": "coronavirus_disease_19",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1727,
    "name": "seasonal_respiratory_virus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1728,
    "name": "respiratory_syncytial_virus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1729,
    "name": "common_cold_pathogen",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1730,
    "name": "spike_protein_enveloped_virus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1731,
    "name": "fusion_protein_negative_ssRNA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1732,
    "name": "segmented_negative_strand_virus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1733,
    "name": "tripartite_genome_order",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1734,
    "name": "ambisense_genome_family",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1735,
    "name": "filamentous_emoji_shape",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1736,
    "name": "bullet_shaped_virus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1737,
    "name": "non_segmented_negative_RNA",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1738,
    "name": "respiratory_fusion_virus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1739,
    "name": "human_airway_infection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1740,
    "name": "morbillivirus_respirovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1741,
    "name": "measles_related_genus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1742,
    "name": "rhino_related_virus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1743,
    "name": "mumps_related_family",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1744,
    "name": "deadly_paramyxovirus_genus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1745,
    "name": "oultry_paramyxovirusAvulavirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1746,
    "name": "Aquaparamyxovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1747,
    "name": "Ferlavirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1748,
    "name": "Jeilongvirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1749,
    "name": "Muromyxovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1751,
    "name": "Protoparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1752,
    "name": "Aveparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1753,
    "name": "Bocaparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1754,
    "name": "Erythroparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1755,
    "name": "Hamaparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1756,
    "name": "Copiparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1757,
    "name": "Bufavirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1758,
    "name": "Turapuvirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1759,
    "name": "Duvarivirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1760,
    "name": "Soosvirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1761,
    "name": "Kappaparovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1762,
    "name": "Betaparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1763,
    "name": "Gammaparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1764,
    "name": "Deltaparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1765,
    "name": "Ezparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1766,
    "name": "Hetaparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1767,
    "name": "Iotaparvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1768,
    "name": "Kapapapapovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1769,
    "name": "Lappa",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1770,
    "name": "Mappa",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1771,
    "name": "NuParv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1772,
    "name": "Omegaparv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1773,
    "name": "Piparv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1774,
    "name": "Roparv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1775,
    "name": "Sigmaparv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1776,
    "name": "Tuparv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1777,
    "name": "Upsparv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1778,
    "name": "Veparv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1779,
    "name": "Xeparv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1780,
    "name": "Yeparv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1781,
    "name": "Zaparv",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1782,
    "name": "p",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1783,
    "name": "fish_infection_virus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1784,
    "name": "reptile_paramyxovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1785,
    "name": "seal_paramyxovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1786,
    "name": "mouse_paramyxovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1787,
    "name": "amphibian_infection",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1788,
    "name": "mammalian_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1789,
    "name": "avian_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1790,
    "name": "respiratory_gastrointestinal",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1791,
    "name": "anemia_causing_virus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1792,
    "name": "bat_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1793,
    "name": "canine_parvovirus_relative",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1794,
    "name": "primate_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1795,
    "name": "bird_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1796,
    "name": "duck_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1797,
    "name": "squirrel_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1798,
    "name": "primate_parvovirus_rel",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1799,
    "name": "second_beta_genus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1800,
    "name": "gamma_genus_member",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1801,
    "name": "delta_variety",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1802,
    "name": "eighth_genus_species",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1803,
    "name": "heterogeneous_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1804,
    "name": "iota_type_parvo",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1805,
    "name": "kappa_alpha_subtype",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1806,
    "name": "lambda_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1807,
    "name": "mu_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1808,
    "name": "nu_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1809,
    "name": "omega_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1810,
    "name": "pi_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1811,
    "name": "rho_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1812,
    "name": "sigma_genus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1813,
    "name": "tau_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1814,
    "name": "upsilon_parvo",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1815,
    "name": "vega_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1816,
    "name": "xi_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1817,
    "name": "eta_parvovirus",
    "type": "concept",
    "description": ""
  },
  {
    "id": 1818,
    "name": "zeta_parvovirus",
    "type": "concept",
    "description": ""
  }
];

// ⚡ FULL 909 RELATIONS EMBEDDED ⚡
const embeddedRelations = [
  {
    "id": 1,
    "subject_id": 1,
    "predicate": "is",
    "object_id": 2,
    "weight": 1
  },
  {
    "id": 2,
    "subject_id": 3,
    "predicate": "is",
    "object_id": 4,
    "weight": 1
  },
  {
    "id": 3,
    "subject_id": 5,
    "predicate": "is",
    "object_id": 6,
    "weight": 1
  },
  {
    "id": 4,
    "subject_id": 7,
    "predicate": "is",
    "object_id": 8,
    "weight": 1
  },
  {
    "id": 5,
    "subject_id": 9,
    "predicate": "is",
    "object_id": 10,
    "weight": 1
  },
  {
    "id": 6,
    "subject_id": 11,
    "predicate": "is",
    "object_id": 12,
    "weight": 1
  },
  {
    "id": 7,
    "subject_id": 7,
    "predicate": "is",
    "object_id": 8,
    "weight": 1
  },
  {
    "id": 8,
    "subject_id": 15,
    "predicate": "'{\"message\":",
    "object_id": 16,
    "weight": 1
  },
  {
    "id": 9,
    "subject_id": 17,
    "predicate": "Network",
    "object_id": 18,
    "weight": 1
  },
  {
    "id": 10,
    "subject_id": 19,
    "predicate": "is",
    "object_id": 20,
    "weight": 1
  },
  {
    "id": 11,
    "subject_id": 21,
    "predicate": "is",
    "object_id": 22,
    "weight": 1
  },
  {
    "id": 12,
    "subject_id": 23,
    "predicate": "Learning",
    "object_id": 24,
    "weight": 1
  },
  {
    "id": 13,
    "subject_id": 25,
    "predicate": "Language",
    "object_id": 26,
    "weight": 1
  },
  {
    "id": 14,
    "subject_id": 27,
    "predicate": "System",
    "object_id": 30,
    "weight": 1
  },
  {
    "id": 15,
    "subject_id": 7,
    "predicate": "is",
    "object_id": 31,
    "weight": 1
  },
  {
    "id": 16,
    "subject_id": 29,
    "predicate": "is",
    "object_id": 32,
    "weight": 1
  },
  {
    "id": 17,
    "subject_id": 9,
    "predicate": "is",
    "object_id": 34,
    "weight": 1
  },
  {
    "id": 18,
    "subject_id": 35,
    "predicate": "Intelligence",
    "object_id": 36,
    "weight": 1
  },
  {
    "id": 19,
    "subject_id": 23,
    "predicate": "Learning",
    "object_id": 38,
    "weight": 1
  },
  {
    "id": 20,
    "subject_id": 39,
    "predicate": "Learning",
    "object_id": 40,
    "weight": 1
  },
  {
    "id": 21,
    "subject_id": 41,
    "predicate": "is",
    "object_id": 42,
    "weight": 1
  },
  {
    "id": 22,
    "subject_id": 25,
    "predicate": "Language",
    "object_id": 44,
    "weight": 1
  },
  {
    "id": 23,
    "subject_id": 45,
    "predicate": "is",
    "object_id": 46,
    "weight": 1
  },
  {
    "id": 24,
    "subject_id": 19,
    "predicate": "is",
    "object_id": 48,
    "weight": 1
  },
  {
    "id": 25,
    "subject_id": 49,
    "predicate": "is",
    "object_id": 50,
    "weight": 1
  },
  {
    "id": 26,
    "subject_id": 21,
    "predicate": "is",
    "object_id": 52,
    "weight": 1
  },
  {
    "id": 27,
    "subject_id": 53,
    "predicate": "is",
    "object_id": 97,
    "weight": 1
  },
  {
    "id": 28,
    "subject_id": 54,
    "predicate": "is",
    "object_id": 98,
    "weight": 1
  },
  {
    "id": 29,
    "subject_id": 55,
    "predicate": "is",
    "object_id": 99,
    "weight": 1
  },
  {
    "id": 30,
    "subject_id": 56,
    "predicate": "is",
    "object_id": 100,
    "weight": 1
  },
  {
    "id": 31,
    "subject_id": 57,
    "predicate": "is",
    "object_id": 101,
    "weight": 1
  },
  {
    "id": 32,
    "subject_id": 58,
    "predicate": "is",
    "object_id": 102,
    "weight": 1
  },
  {
    "id": 33,
    "subject_id": 59,
    "predicate": "is",
    "object_id": 103,
    "weight": 1
  },
  {
    "id": 34,
    "subject_id": 60,
    "predicate": "is",
    "object_id": 104,
    "weight": 1
  },
  {
    "id": 35,
    "subject_id": 61,
    "predicate": "is",
    "object_id": 105,
    "weight": 1
  },
  {
    "id": 36,
    "subject_id": 62,
    "predicate": "is",
    "object_id": 106,
    "weight": 1
  },
  {
    "id": 37,
    "subject_id": 11,
    "predicate": "is",
    "object_id": 107,
    "weight": 1
  },
  {
    "id": 38,
    "subject_id": 64,
    "predicate": "is",
    "object_id": 108,
    "weight": 1
  },
  {
    "id": 39,
    "subject_id": 65,
    "predicate": "is",
    "object_id": 109,
    "weight": 1
  },
  {
    "id": 40,
    "subject_id": 66,
    "predicate": "is",
    "object_id": 110,
    "weight": 1
  },
  {
    "id": 41,
    "subject_id": 67,
    "predicate": "is",
    "object_id": 111,
    "weight": 1
  },
  {
    "id": 42,
    "subject_id": 68,
    "predicate": "is",
    "object_id": 112,
    "weight": 1
  },
  {
    "id": 43,
    "subject_id": 69,
    "predicate": "is",
    "object_id": 113,
    "weight": 1
  },
  {
    "id": 44,
    "subject_id": 70,
    "predicate": "is",
    "object_id": 114,
    "weight": 1
  },
  {
    "id": 45,
    "subject_id": 71,
    "predicate": "is",
    "object_id": 115,
    "weight": 1
  },
  {
    "id": 46,
    "subject_id": 72,
    "predicate": "is",
    "object_id": 116,
    "weight": 1
  },
  {
    "id": 47,
    "subject_id": 73,
    "predicate": "is",
    "object_id": 117,
    "weight": 1
  },
  {
    "id": 48,
    "subject_id": 74,
    "predicate": "is",
    "object_id": 118,
    "weight": 1
  },
  {
    "id": 49,
    "subject_id": 75,
    "predicate": "is",
    "object_id": 119,
    "weight": 1
  },
  {
    "id": 50,
    "subject_id": 76,
    "predicate": "is",
    "object_id": 120,
    "weight": 1
  },
  {
    "id": 51,
    "subject_id": 77,
    "predicate": "is",
    "object_id": 121,
    "weight": 1
  },
  {
    "id": 52,
    "subject_id": 78,
    "predicate": "is",
    "object_id": 122,
    "weight": 1
  },
  {
    "id": 53,
    "subject_id": 79,
    "predicate": "is",
    "object_id": 123,
    "weight": 1
  },
  {
    "id": 54,
    "subject_id": 80,
    "predicate": "is",
    "object_id": 124,
    "weight": 1
  },
  {
    "id": 55,
    "subject_id": 81,
    "predicate": "is",
    "object_id": 125,
    "weight": 1
  },
  {
    "id": 56,
    "subject_id": 82,
    "predicate": "is",
    "object_id": 126,
    "weight": 1
  },
  {
    "id": 57,
    "subject_id": 83,
    "predicate": "is",
    "object_id": 127,
    "weight": 1
  },
  {
    "id": 58,
    "subject_id": 84,
    "predicate": "is",
    "object_id": 128,
    "weight": 1
  },
  {
    "id": 59,
    "subject_id": 85,
    "predicate": "is",
    "object_id": 129,
    "weight": 1
  },
  {
    "id": 60,
    "subject_id": 86,
    "predicate": "is",
    "object_id": 130,
    "weight": 1
  },
  {
    "id": 61,
    "subject_id": 87,
    "predicate": "is",
    "object_id": 131,
    "weight": 1
  },
  {
    "id": 62,
    "subject_id": 88,
    "predicate": "is",
    "object_id": 132,
    "weight": 1
  },
  {
    "id": 63,
    "subject_id": 89,
    "predicate": "is",
    "object_id": 133,
    "weight": 1
  },
  {
    "id": 64,
    "subject_id": 90,
    "predicate": "is",
    "object_id": 134,
    "weight": 1
  },
  {
    "id": 65,
    "subject_id": 91,
    "predicate": "is",
    "object_id": 135,
    "weight": 1
  },
  {
    "id": 66,
    "subject_id": 92,
    "predicate": "is",
    "object_id": 136,
    "weight": 1
  },
  {
    "id": 67,
    "subject_id": 93,
    "predicate": "is",
    "object_id": 137,
    "weight": 1
  },
  {
    "id": 68,
    "subject_id": 94,
    "predicate": "is",
    "object_id": 138,
    "weight": 1
  },
  {
    "id": 69,
    "subject_id": 95,
    "predicate": "is",
    "object_id": 139,
    "weight": 1
  },
  {
    "id": 70,
    "subject_id": 96,
    "predicate": "is",
    "object_id": 140,
    "weight": 1
  },
  {
    "id": 71,
    "subject_id": 141,
    "predicate": "is",
    "object_id": 207,
    "weight": 1
  },
  {
    "id": 72,
    "subject_id": 142,
    "predicate": "is",
    "object_id": 208,
    "weight": 1
  },
  {
    "id": 73,
    "subject_id": 143,
    "predicate": "is",
    "object_id": 209,
    "weight": 1
  },
  {
    "id": 74,
    "subject_id": 144,
    "predicate": "is",
    "object_id": 210,
    "weight": 1
  },
  {
    "id": 75,
    "subject_id": 145,
    "predicate": "is",
    "object_id": 211,
    "weight": 1
  },
  {
    "id": 76,
    "subject_id": 146,
    "predicate": "is",
    "object_id": 212,
    "weight": 1
  },
  {
    "id": 77,
    "subject_id": 147,
    "predicate": "is",
    "object_id": 213,
    "weight": 1
  },
  {
    "id": 78,
    "subject_id": 148,
    "predicate": "is",
    "object_id": 214,
    "weight": 1
  },
  {
    "id": 79,
    "subject_id": 149,
    "predicate": "is",
    "object_id": 215,
    "weight": 1
  },
  {
    "id": 80,
    "subject_id": 150,
    "predicate": "is",
    "object_id": 216,
    "weight": 1
  },
  {
    "id": 81,
    "subject_id": 151,
    "predicate": "is",
    "object_id": 217,
    "weight": 1
  },
  {
    "id": 82,
    "subject_id": 152,
    "predicate": "is",
    "object_id": 218,
    "weight": 1
  },
  {
    "id": 83,
    "subject_id": 153,
    "predicate": "is",
    "object_id": 219,
    "weight": 1
  },
  {
    "id": 84,
    "subject_id": 154,
    "predicate": "is",
    "object_id": 220,
    "weight": 1
  },
  {
    "id": 85,
    "subject_id": 155,
    "predicate": "is",
    "object_id": 221,
    "weight": 1
  },
  {
    "id": 86,
    "subject_id": 156,
    "predicate": "is",
    "object_id": 222,
    "weight": 1
  },
  {
    "id": 87,
    "subject_id": 157,
    "predicate": "is",
    "object_id": 223,
    "weight": 1
  },
  {
    "id": 88,
    "subject_id": 158,
    "predicate": "is",
    "object_id": 224,
    "weight": 1
  },
  {
    "id": 89,
    "subject_id": 159,
    "predicate": "is",
    "object_id": 225,
    "weight": 1
  },
  {
    "id": 90,
    "subject_id": 160,
    "predicate": "is",
    "object_id": 226,
    "weight": 1
  },
  {
    "id": 91,
    "subject_id": 161,
    "predicate": "is",
    "object_id": 227,
    "weight": 1
  },
  {
    "id": 92,
    "subject_id": 162,
    "predicate": "is",
    "object_id": 228,
    "weight": 1
  },
  {
    "id": 93,
    "subject_id": 163,
    "predicate": "is",
    "object_id": 229,
    "weight": 1
  },
  {
    "id": 94,
    "subject_id": 164,
    "predicate": "is",
    "object_id": 230,
    "weight": 1
  },
  {
    "id": 95,
    "subject_id": 165,
    "predicate": "is",
    "object_id": 231,
    "weight": 1
  },
  {
    "id": 96,
    "subject_id": 166,
    "predicate": "is",
    "object_id": 232,
    "weight": 1
  },
  {
    "id": 97,
    "subject_id": 167,
    "predicate": "is",
    "object_id": 233,
    "weight": 1
  },
  {
    "id": 98,
    "subject_id": 168,
    "predicate": "is",
    "object_id": 234,
    "weight": 1
  },
  {
    "id": 99,
    "subject_id": 169,
    "predicate": "is",
    "object_id": 235,
    "weight": 1
  },
  {
    "id": 100,
    "subject_id": 170,
    "predicate": "is",
    "object_id": 236,
    "weight": 1
  },
  {
    "id": 101,
    "subject_id": 171,
    "predicate": "is",
    "object_id": 237,
    "weight": 1
  },
  {
    "id": 102,
    "subject_id": 172,
    "predicate": "is",
    "object_id": 238,
    "weight": 1
  },
  {
    "id": 103,
    "subject_id": 173,
    "predicate": "is",
    "object_id": 239,
    "weight": 1
  },
  {
    "id": 104,
    "subject_id": 174,
    "predicate": "is",
    "object_id": 240,
    "weight": 1
  },
  {
    "id": 105,
    "subject_id": 175,
    "predicate": "is",
    "object_id": 241,
    "weight": 1
  },
  {
    "id": 106,
    "subject_id": 176,
    "predicate": "is",
    "object_id": 242,
    "weight": 1
  },
  {
    "id": 107,
    "subject_id": 177,
    "predicate": "is",
    "object_id": 243,
    "weight": 1
  },
  {
    "id": 108,
    "subject_id": 178,
    "predicate": "is",
    "object_id": 244,
    "weight": 1
  },
  {
    "id": 109,
    "subject_id": 179,
    "predicate": "is",
    "object_id": 245,
    "weight": 1
  },
  {
    "id": 110,
    "subject_id": 180,
    "predicate": "is",
    "object_id": 246,
    "weight": 1
  },
  {
    "id": 111,
    "subject_id": 181,
    "predicate": "is",
    "object_id": 247,
    "weight": 1
  },
  {
    "id": 112,
    "subject_id": 182,
    "predicate": "is",
    "object_id": 248,
    "weight": 1
  },
  {
    "id": 113,
    "subject_id": 183,
    "predicate": "is",
    "object_id": 249,
    "weight": 1
  },
  {
    "id": 114,
    "subject_id": 184,
    "predicate": "is",
    "object_id": 250,
    "weight": 1
  },
  {
    "id": 115,
    "subject_id": 185,
    "predicate": "is",
    "object_id": 251,
    "weight": 1
  },
  {
    "id": 116,
    "subject_id": 186,
    "predicate": "is",
    "object_id": 252,
    "weight": 1
  },
  {
    "id": 117,
    "subject_id": 187,
    "predicate": "is",
    "object_id": 253,
    "weight": 1
  },
  {
    "id": 118,
    "subject_id": 188,
    "predicate": "is",
    "object_id": 254,
    "weight": 1
  },
  {
    "id": 119,
    "subject_id": 189,
    "predicate": "is",
    "object_id": 255,
    "weight": 1
  },
  {
    "id": 120,
    "subject_id": 190,
    "predicate": "is",
    "object_id": 256,
    "weight": 1
  },
  {
    "id": 121,
    "subject_id": 191,
    "predicate": "is",
    "object_id": 257,
    "weight": 1
  },
  {
    "id": 122,
    "subject_id": 192,
    "predicate": "is",
    "object_id": 258,
    "weight": 1
  },
  {
    "id": 123,
    "subject_id": 193,
    "predicate": "is",
    "object_id": 259,
    "weight": 1
  },
  {
    "id": 124,
    "subject_id": 194,
    "predicate": "is",
    "object_id": 260,
    "weight": 1
  },
  {
    "id": 125,
    "subject_id": 195,
    "predicate": "is",
    "object_id": 261,
    "weight": 1
  },
  {
    "id": 126,
    "subject_id": 196,
    "predicate": "is",
    "object_id": 262,
    "weight": 1
  },
  {
    "id": 127,
    "subject_id": 197,
    "predicate": "is",
    "object_id": 263,
    "weight": 1
  },
  {
    "id": 128,
    "subject_id": 198,
    "predicate": "is",
    "object_id": 264,
    "weight": 1
  },
  {
    "id": 129,
    "subject_id": 199,
    "predicate": "is",
    "object_id": 265,
    "weight": 1
  },
  {
    "id": 130,
    "subject_id": 200,
    "predicate": "is",
    "object_id": 266,
    "weight": 1
  },
  {
    "id": 131,
    "subject_id": 201,
    "predicate": "is",
    "object_id": 267,
    "weight": 1
  },
  {
    "id": 132,
    "subject_id": 202,
    "predicate": "is",
    "object_id": 268,
    "weight": 1
  },
  {
    "id": 133,
    "subject_id": 203,
    "predicate": "is",
    "object_id": 269,
    "weight": 1
  },
  {
    "id": 134,
    "subject_id": 204,
    "predicate": "is",
    "object_id": 270,
    "weight": 1
  },
  {
    "id": 135,
    "subject_id": 205,
    "predicate": "is",
    "object_id": 271,
    "weight": 1
  },
  {
    "id": 136,
    "subject_id": 206,
    "predicate": "is",
    "object_id": 272,
    "weight": 1
  },
  {
    "id": 137,
    "subject_id": 273,
    "predicate": "is",
    "object_id": 336,
    "weight": 1
  },
  {
    "id": 138,
    "subject_id": 274,
    "predicate": "is",
    "object_id": 337,
    "weight": 1
  },
  {
    "id": 139,
    "subject_id": 275,
    "predicate": "is",
    "object_id": 338,
    "weight": 1
  },
  {
    "id": 140,
    "subject_id": 276,
    "predicate": "is",
    "object_id": 339,
    "weight": 1
  },
  {
    "id": 141,
    "subject_id": 277,
    "predicate": "is",
    "object_id": 340,
    "weight": 1
  },
  {
    "id": 142,
    "subject_id": 278,
    "predicate": "is",
    "object_id": 341,
    "weight": 1
  },
  {
    "id": 143,
    "subject_id": 279,
    "predicate": "is",
    "object_id": 342,
    "weight": 1
  },
  {
    "id": 144,
    "subject_id": 280,
    "predicate": "is",
    "object_id": 343,
    "weight": 1
  },
  {
    "id": 145,
    "subject_id": 281,
    "predicate": "is",
    "object_id": 344,
    "weight": 1
  },
  {
    "id": 146,
    "subject_id": 282,
    "predicate": "is",
    "object_id": 345,
    "weight": 1
  },
  {
    "id": 147,
    "subject_id": 283,
    "predicate": "is",
    "object_id": 346,
    "weight": 1
  },
  {
    "id": 148,
    "subject_id": 284,
    "predicate": "is",
    "object_id": 347,
    "weight": 1
  },
  {
    "id": 149,
    "subject_id": 285,
    "predicate": "is",
    "object_id": 348,
    "weight": 1
  },
  {
    "id": 150,
    "subject_id": 286,
    "predicate": "is",
    "object_id": 349,
    "weight": 1
  },
  {
    "id": 151,
    "subject_id": 287,
    "predicate": "is",
    "object_id": 350,
    "weight": 1
  },
  {
    "id": 152,
    "subject_id": 288,
    "predicate": "is",
    "object_id": 351,
    "weight": 1
  },
  {
    "id": 153,
    "subject_id": 289,
    "predicate": "is",
    "object_id": 352,
    "weight": 1
  },
  {
    "id": 154,
    "subject_id": 290,
    "predicate": "is",
    "object_id": 353,
    "weight": 1
  },
  {
    "id": 155,
    "subject_id": 291,
    "predicate": "is",
    "object_id": 354,
    "weight": 1
  },
  {
    "id": 156,
    "subject_id": 292,
    "predicate": "is",
    "object_id": 355,
    "weight": 1
  },
  {
    "id": 157,
    "subject_id": 293,
    "predicate": "is",
    "object_id": 356,
    "weight": 1
  },
  {
    "id": 158,
    "subject_id": 294,
    "predicate": "is",
    "object_id": 357,
    "weight": 1
  },
  {
    "id": 159,
    "subject_id": 295,
    "predicate": "is",
    "object_id": 358,
    "weight": 1
  },
  {
    "id": 160,
    "subject_id": 296,
    "predicate": "is",
    "object_id": 359,
    "weight": 1
  },
  {
    "id": 161,
    "subject_id": 297,
    "predicate": "is",
    "object_id": 360,
    "weight": 1
  },
  {
    "id": 162,
    "subject_id": 298,
    "predicate": "is",
    "object_id": 361,
    "weight": 1
  },
  {
    "id": 163,
    "subject_id": 299,
    "predicate": "is",
    "object_id": 362,
    "weight": 1
  },
  {
    "id": 164,
    "subject_id": 300,
    "predicate": "is",
    "object_id": 363,
    "weight": 1
  },
  {
    "id": 165,
    "subject_id": 301,
    "predicate": "is",
    "object_id": 364,
    "weight": 1
  },
  {
    "id": 166,
    "subject_id": 302,
    "predicate": "is",
    "object_id": 365,
    "weight": 1
  },
  {
    "id": 167,
    "subject_id": 303,
    "predicate": "is",
    "object_id": 366,
    "weight": 1
  },
  {
    "id": 168,
    "subject_id": 304,
    "predicate": "is",
    "object_id": 367,
    "weight": 1
  },
  {
    "id": 169,
    "subject_id": 305,
    "predicate": "is",
    "object_id": 368,
    "weight": 1
  },
  {
    "id": 170,
    "subject_id": 306,
    "predicate": "is",
    "object_id": 369,
    "weight": 1
  },
  {
    "id": 171,
    "subject_id": 307,
    "predicate": "is",
    "object_id": 370,
    "weight": 1
  },
  {
    "id": 172,
    "subject_id": 308,
    "predicate": "is",
    "object_id": 371,
    "weight": 1
  },
  {
    "id": 173,
    "subject_id": 309,
    "predicate": "is",
    "object_id": 372,
    "weight": 1
  },
  {
    "id": 174,
    "subject_id": 310,
    "predicate": "is",
    "object_id": 373,
    "weight": 1
  },
  {
    "id": 175,
    "subject_id": 311,
    "predicate": "is",
    "object_id": 374,
    "weight": 1
  },
  {
    "id": 176,
    "subject_id": 312,
    "predicate": "is",
    "object_id": 375,
    "weight": 1
  },
  {
    "id": 177,
    "subject_id": 313,
    "predicate": "is",
    "object_id": 376,
    "weight": 1
  },
  {
    "id": 178,
    "subject_id": 314,
    "predicate": "is",
    "object_id": 216,
    "weight": 1
  },
  {
    "id": 179,
    "subject_id": 315,
    "predicate": "is",
    "object_id": 378,
    "weight": 1
  },
  {
    "id": 180,
    "subject_id": 316,
    "predicate": "is",
    "object_id": 379,
    "weight": 1
  },
  {
    "id": 181,
    "subject_id": 317,
    "predicate": "is",
    "object_id": 380,
    "weight": 1
  },
  {
    "id": 182,
    "subject_id": 318,
    "predicate": "is",
    "object_id": 381,
    "weight": 1
  },
  {
    "id": 183,
    "subject_id": 319,
    "predicate": "is",
    "object_id": 382,
    "weight": 1
  },
  {
    "id": 184,
    "subject_id": 320,
    "predicate": "is",
    "object_id": 383,
    "weight": 1
  },
  {
    "id": 185,
    "subject_id": 321,
    "predicate": "is",
    "object_id": 384,
    "weight": 1
  },
  {
    "id": 186,
    "subject_id": 322,
    "predicate": "is",
    "object_id": 385,
    "weight": 1
  },
  {
    "id": 187,
    "subject_id": 323,
    "predicate": "is",
    "object_id": 386,
    "weight": 1
  },
  {
    "id": 188,
    "subject_id": 324,
    "predicate": "is",
    "object_id": 387,
    "weight": 1
  },
  {
    "id": 189,
    "subject_id": 325,
    "predicate": "is",
    "object_id": 388,
    "weight": 1
  },
  {
    "id": 190,
    "subject_id": 326,
    "predicate": "is",
    "object_id": 389,
    "weight": 1
  },
  {
    "id": 191,
    "subject_id": 327,
    "predicate": "is",
    "object_id": 390,
    "weight": 1
  },
  {
    "id": 192,
    "subject_id": 328,
    "predicate": "is",
    "object_id": 391,
    "weight": 1
  },
  {
    "id": 193,
    "subject_id": 329,
    "predicate": "is",
    "object_id": 392,
    "weight": 1
  },
  {
    "id": 194,
    "subject_id": 330,
    "predicate": "is",
    "object_id": 393,
    "weight": 1
  },
  {
    "id": 195,
    "subject_id": 331,
    "predicate": "is",
    "object_id": 394,
    "weight": 1
  },
  {
    "id": 196,
    "subject_id": 332,
    "predicate": "is",
    "object_id": 395,
    "weight": 1
  },
  {
    "id": 197,
    "subject_id": 333,
    "predicate": "is",
    "object_id": 396,
    "weight": 1
  },
  {
    "id": 198,
    "subject_id": 334,
    "predicate": "is",
    "object_id": 397,
    "weight": 1
  },
  {
    "id": 199,
    "subject_id": 335,
    "predicate": "is",
    "object_id": 398,
    "weight": 1
  },
  {
    "id": 200,
    "subject_id": 399,
    "predicate": "is",
    "object_id": 457,
    "weight": 1
  },
  {
    "id": 201,
    "subject_id": 400,
    "predicate": "is",
    "object_id": 458,
    "weight": 1
  },
  {
    "id": 202,
    "subject_id": 401,
    "predicate": "is",
    "object_id": 459,
    "weight": 1
  },
  {
    "id": 203,
    "subject_id": 402,
    "predicate": "is",
    "object_id": 460,
    "weight": 1
  },
  {
    "id": 204,
    "subject_id": 403,
    "predicate": "is",
    "object_id": 461,
    "weight": 1
  },
  {
    "id": 205,
    "subject_id": 404,
    "predicate": "is",
    "object_id": 462,
    "weight": 1
  },
  {
    "id": 206,
    "subject_id": 405,
    "predicate": "is",
    "object_id": 463,
    "weight": 1
  },
  {
    "id": 207,
    "subject_id": 406,
    "predicate": "is",
    "object_id": 464,
    "weight": 1
  },
  {
    "id": 208,
    "subject_id": 407,
    "predicate": "is",
    "object_id": 465,
    "weight": 1
  },
  {
    "id": 209,
    "subject_id": 408,
    "predicate": "is",
    "object_id": 466,
    "weight": 1
  },
  {
    "id": 210,
    "subject_id": 409,
    "predicate": "is",
    "object_id": 467,
    "weight": 1
  },
  {
    "id": 211,
    "subject_id": 410,
    "predicate": "is",
    "object_id": 468,
    "weight": 1
  },
  {
    "id": 212,
    "subject_id": 411,
    "predicate": "is",
    "object_id": 469,
    "weight": 1
  },
  {
    "id": 213,
    "subject_id": 412,
    "predicate": "is",
    "object_id": 470,
    "weight": 1
  },
  {
    "id": 214,
    "subject_id": 413,
    "predicate": "is",
    "object_id": 471,
    "weight": 1
  },
  {
    "id": 215,
    "subject_id": 414,
    "predicate": "is",
    "object_id": 472,
    "weight": 1
  },
  {
    "id": 216,
    "subject_id": 415,
    "predicate": "is",
    "object_id": 473,
    "weight": 1
  },
  {
    "id": 217,
    "subject_id": 416,
    "predicate": "is",
    "object_id": 474,
    "weight": 1
  },
  {
    "id": 218,
    "subject_id": 417,
    "predicate": "is",
    "object_id": 475,
    "weight": 1
  },
  {
    "id": 219,
    "subject_id": 418,
    "predicate": "is",
    "object_id": 476,
    "weight": 1
  },
  {
    "id": 220,
    "subject_id": 419,
    "predicate": "is",
    "object_id": 477,
    "weight": 1
  },
  {
    "id": 221,
    "subject_id": 420,
    "predicate": "is",
    "object_id": 478,
    "weight": 1
  },
  {
    "id": 222,
    "subject_id": 421,
    "predicate": "is",
    "object_id": 479,
    "weight": 1
  },
  {
    "id": 223,
    "subject_id": 422,
    "predicate": "is",
    "object_id": 480,
    "weight": 1
  },
  {
    "id": 224,
    "subject_id": 423,
    "predicate": "is",
    "object_id": 481,
    "weight": 1
  },
  {
    "id": 225,
    "subject_id": 424,
    "predicate": "is",
    "object_id": 482,
    "weight": 1
  },
  {
    "id": 226,
    "subject_id": 425,
    "predicate": "is",
    "object_id": 483,
    "weight": 1
  },
  {
    "id": 227,
    "subject_id": 426,
    "predicate": "is",
    "object_id": 484,
    "weight": 1
  },
  {
    "id": 228,
    "subject_id": 427,
    "predicate": "is",
    "object_id": 485,
    "weight": 1
  },
  {
    "id": 229,
    "subject_id": 428,
    "predicate": "is",
    "object_id": 486,
    "weight": 1
  },
  {
    "id": 230,
    "subject_id": 429,
    "predicate": "is",
    "object_id": 487,
    "weight": 1
  },
  {
    "id": 231,
    "subject_id": 430,
    "predicate": "is",
    "object_id": 488,
    "weight": 1
  },
  {
    "id": 232,
    "subject_id": 431,
    "predicate": "is",
    "object_id": 489,
    "weight": 1
  },
  {
    "id": 233,
    "subject_id": 432,
    "predicate": "is",
    "object_id": 490,
    "weight": 1
  },
  {
    "id": 234,
    "subject_id": 433,
    "predicate": "is",
    "object_id": 491,
    "weight": 1
  },
  {
    "id": 235,
    "subject_id": 434,
    "predicate": "is",
    "object_id": 492,
    "weight": 1
  },
  {
    "id": 236,
    "subject_id": 435,
    "predicate": "is",
    "object_id": 493,
    "weight": 1
  },
  {
    "id": 237,
    "subject_id": 436,
    "predicate": "is",
    "object_id": 494,
    "weight": 1
  },
  {
    "id": 238,
    "subject_id": 437,
    "predicate": "is",
    "object_id": 495,
    "weight": 1
  },
  {
    "id": 239,
    "subject_id": 438,
    "predicate": "is",
    "object_id": 496,
    "weight": 1
  },
  {
    "id": 240,
    "subject_id": 439,
    "predicate": "is",
    "object_id": 497,
    "weight": 1
  },
  {
    "id": 241,
    "subject_id": 440,
    "predicate": "is",
    "object_id": 498,
    "weight": 1
  },
  {
    "id": 242,
    "subject_id": 441,
    "predicate": "is",
    "object_id": 499,
    "weight": 1
  },
  {
    "id": 243,
    "subject_id": 442,
    "predicate": "is",
    "object_id": 500,
    "weight": 1
  },
  {
    "id": 244,
    "subject_id": 443,
    "predicate": "is",
    "object_id": 501,
    "weight": 1
  },
  {
    "id": 245,
    "subject_id": 444,
    "predicate": "is",
    "object_id": 502,
    "weight": 1
  },
  {
    "id": 246,
    "subject_id": 445,
    "predicate": "is",
    "object_id": 503,
    "weight": 1
  },
  {
    "id": 247,
    "subject_id": 446,
    "predicate": "is",
    "object_id": 504,
    "weight": 1
  },
  {
    "id": 248,
    "subject_id": 447,
    "predicate": "is",
    "object_id": 505,
    "weight": 1
  },
  {
    "id": 249,
    "subject_id": 448,
    "predicate": "is",
    "object_id": 506,
    "weight": 1
  },
  {
    "id": 250,
    "subject_id": 449,
    "predicate": "is",
    "object_id": 507,
    "weight": 1
  },
  {
    "id": 251,
    "subject_id": 450,
    "predicate": "is",
    "object_id": 508,
    "weight": 1
  },
  {
    "id": 252,
    "subject_id": 451,
    "predicate": "is",
    "object_id": 509,
    "weight": 1
  },
  {
    "id": 253,
    "subject_id": 452,
    "predicate": "is",
    "object_id": 510,
    "weight": 1
  },
  {
    "id": 254,
    "subject_id": 453,
    "predicate": "is",
    "object_id": 511,
    "weight": 1
  },
  {
    "id": 255,
    "subject_id": 454,
    "predicate": "is",
    "object_id": 512,
    "weight": 1
  },
  {
    "id": 256,
    "subject_id": 455,
    "predicate": "is",
    "object_id": 513,
    "weight": 1
  },
  {
    "id": 257,
    "subject_id": 456,
    "predicate": "is",
    "object_id": 514,
    "weight": 1
  },
  {
    "id": 258,
    "subject_id": 515,
    "predicate": "is",
    "object_id": 566,
    "weight": 1
  },
  {
    "id": 259,
    "subject_id": 516,
    "predicate": "is",
    "object_id": 567,
    "weight": 1
  },
  {
    "id": 260,
    "subject_id": 517,
    "predicate": "is",
    "object_id": 568,
    "weight": 1
  },
  {
    "id": 261,
    "subject_id": 518,
    "predicate": "is",
    "object_id": 569,
    "weight": 1
  },
  {
    "id": 262,
    "subject_id": 519,
    "predicate": "is",
    "object_id": 570,
    "weight": 1
  },
  {
    "id": 263,
    "subject_id": 520,
    "predicate": "is",
    "object_id": 571,
    "weight": 1
  },
  {
    "id": 264,
    "subject_id": 521,
    "predicate": "is",
    "object_id": 572,
    "weight": 1
  },
  {
    "id": 265,
    "subject_id": 522,
    "predicate": "is",
    "object_id": 573,
    "weight": 1
  },
  {
    "id": 266,
    "subject_id": 523,
    "predicate": "is",
    "object_id": 574,
    "weight": 1
  },
  {
    "id": 267,
    "subject_id": 524,
    "predicate": "is",
    "object_id": 575,
    "weight": 1
  },
  {
    "id": 268,
    "subject_id": 525,
    "predicate": "is",
    "object_id": 576,
    "weight": 1
  },
  {
    "id": 269,
    "subject_id": 526,
    "predicate": "is",
    "object_id": 577,
    "weight": 1
  },
  {
    "id": 270,
    "subject_id": 527,
    "predicate": "is",
    "object_id": 578,
    "weight": 1
  },
  {
    "id": 271,
    "subject_id": 528,
    "predicate": "is",
    "object_id": 579,
    "weight": 1
  },
  {
    "id": 272,
    "subject_id": 529,
    "predicate": "is",
    "object_id": 580,
    "weight": 1
  },
  {
    "id": 273,
    "subject_id": 530,
    "predicate": "is",
    "object_id": 581,
    "weight": 1
  },
  {
    "id": 274,
    "subject_id": 531,
    "predicate": "is",
    "object_id": 582,
    "weight": 1
  },
  {
    "id": 275,
    "subject_id": 532,
    "predicate": "is",
    "object_id": 583,
    "weight": 1
  },
  {
    "id": 276,
    "subject_id": 533,
    "predicate": "is",
    "object_id": 584,
    "weight": 1
  },
  {
    "id": 277,
    "subject_id": 534,
    "predicate": "is",
    "object_id": 585,
    "weight": 1
  },
  {
    "id": 278,
    "subject_id": 535,
    "predicate": "is",
    "object_id": 586,
    "weight": 1
  },
  {
    "id": 279,
    "subject_id": 536,
    "predicate": "is",
    "object_id": 587,
    "weight": 1
  },
  {
    "id": 280,
    "subject_id": 537,
    "predicate": "is",
    "object_id": 588,
    "weight": 1
  },
  {
    "id": 281,
    "subject_id": 538,
    "predicate": "is",
    "object_id": 589,
    "weight": 1
  },
  {
    "id": 282,
    "subject_id": 539,
    "predicate": "is",
    "object_id": 590,
    "weight": 1
  },
  {
    "id": 283,
    "subject_id": 540,
    "predicate": "is",
    "object_id": 591,
    "weight": 1
  },
  {
    "id": 284,
    "subject_id": 541,
    "predicate": "is",
    "object_id": 592,
    "weight": 1
  },
  {
    "id": 285,
    "subject_id": 542,
    "predicate": "is",
    "object_id": 593,
    "weight": 1
  },
  {
    "id": 286,
    "subject_id": 543,
    "predicate": "is",
    "object_id": 594,
    "weight": 1
  },
  {
    "id": 287,
    "subject_id": 544,
    "predicate": "is",
    "object_id": 595,
    "weight": 1
  },
  {
    "id": 288,
    "subject_id": 545,
    "predicate": "is",
    "object_id": 596,
    "weight": 1
  },
  {
    "id": 289,
    "subject_id": 546,
    "predicate": "is",
    "object_id": 597,
    "weight": 1
  },
  {
    "id": 290,
    "subject_id": 547,
    "predicate": "is",
    "object_id": 598,
    "weight": 1
  },
  {
    "id": 291,
    "subject_id": 548,
    "predicate": "is",
    "object_id": 599,
    "weight": 1
  },
  {
    "id": 292,
    "subject_id": 549,
    "predicate": "is",
    "object_id": 600,
    "weight": 1
  },
  {
    "id": 293,
    "subject_id": 550,
    "predicate": "is",
    "object_id": 601,
    "weight": 1
  },
  {
    "id": 294,
    "subject_id": 551,
    "predicate": "is",
    "object_id": 602,
    "weight": 1
  },
  {
    "id": 295,
    "subject_id": 552,
    "predicate": "is",
    "object_id": 603,
    "weight": 1
  },
  {
    "id": 296,
    "subject_id": 553,
    "predicate": "is",
    "object_id": 604,
    "weight": 1
  },
  {
    "id": 297,
    "subject_id": 554,
    "predicate": "is",
    "object_id": 605,
    "weight": 1
  },
  {
    "id": 298,
    "subject_id": 555,
    "predicate": "is",
    "object_id": 606,
    "weight": 1
  },
  {
    "id": 299,
    "subject_id": 556,
    "predicate": "is",
    "object_id": 607,
    "weight": 1
  },
  {
    "id": 300,
    "subject_id": 557,
    "predicate": "is",
    "object_id": 608,
    "weight": 1
  },
  {
    "id": 301,
    "subject_id": 558,
    "predicate": "is",
    "object_id": 609,
    "weight": 1
  },
  {
    "id": 302,
    "subject_id": 559,
    "predicate": "is",
    "object_id": 610,
    "weight": 1
  },
  {
    "id": 303,
    "subject_id": 560,
    "predicate": "is",
    "object_id": 611,
    "weight": 1
  },
  {
    "id": 304,
    "subject_id": 561,
    "predicate": "is",
    "object_id": 612,
    "weight": 1
  },
  {
    "id": 305,
    "subject_id": 562,
    "predicate": "is",
    "object_id": 613,
    "weight": 1
  },
  {
    "id": 306,
    "subject_id": 563,
    "predicate": "is",
    "object_id": 614,
    "weight": 1
  },
  {
    "id": 307,
    "subject_id": 564,
    "predicate": "is",
    "object_id": 615,
    "weight": 1
  },
  {
    "id": 308,
    "subject_id": 565,
    "predicate": "is",
    "object_id": 616,
    "weight": 1
  },
  {
    "id": 309,
    "subject_id": 617,
    "predicate": "is",
    "object_id": 666,
    "weight": 1
  },
  {
    "id": 310,
    "subject_id": 618,
    "predicate": "is",
    "object_id": 667,
    "weight": 1
  },
  {
    "id": 311,
    "subject_id": 619,
    "predicate": "is",
    "object_id": 668,
    "weight": 1
  },
  {
    "id": 312,
    "subject_id": 620,
    "predicate": "is",
    "object_id": 669,
    "weight": 1
  },
  {
    "id": 313,
    "subject_id": 621,
    "predicate": "is",
    "object_id": 670,
    "weight": 1
  },
  {
    "id": 314,
    "subject_id": 622,
    "predicate": "is",
    "object_id": 671,
    "weight": 1
  },
  {
    "id": 315,
    "subject_id": 623,
    "predicate": "is",
    "object_id": 672,
    "weight": 1
  },
  {
    "id": 316,
    "subject_id": 624,
    "predicate": "is",
    "object_id": 673,
    "weight": 1
  },
  {
    "id": 317,
    "subject_id": 625,
    "predicate": "is",
    "object_id": 674,
    "weight": 1
  },
  {
    "id": 318,
    "subject_id": 626,
    "predicate": "is",
    "object_id": 675,
    "weight": 1
  },
  {
    "id": 319,
    "subject_id": 627,
    "predicate": "is",
    "object_id": 676,
    "weight": 1
  },
  {
    "id": 320,
    "subject_id": 628,
    "predicate": "is",
    "object_id": 677,
    "weight": 1
  },
  {
    "id": 321,
    "subject_id": 629,
    "predicate": "is",
    "object_id": 678,
    "weight": 1
  },
  {
    "id": 322,
    "subject_id": 630,
    "predicate": "is",
    "object_id": 679,
    "weight": 1
  },
  {
    "id": 323,
    "subject_id": 631,
    "predicate": "is",
    "object_id": 680,
    "weight": 1
  },
  {
    "id": 324,
    "subject_id": 632,
    "predicate": "is",
    "object_id": 681,
    "weight": 1
  },
  {
    "id": 325,
    "subject_id": 633,
    "predicate": "is",
    "object_id": 682,
    "weight": 1
  },
  {
    "id": 326,
    "subject_id": 426,
    "predicate": "connects_to",
    "object_id": 683,
    "weight": 1
  },
  {
    "id": 327,
    "subject_id": 635,
    "predicate": "connects_to",
    "object_id": 416,
    "weight": 1
  },
  {
    "id": 328,
    "subject_id": 636,
    "predicate": "connects_to",
    "object_id": 205,
    "weight": 1
  },
  {
    "id": 329,
    "subject_id": 637,
    "predicate": "connects_to",
    "object_id": 686,
    "weight": 1
  },
  {
    "id": 330,
    "subject_id": 638,
    "predicate": "connects_to",
    "object_id": 553,
    "weight": 1
  },
  {
    "id": 331,
    "subject_id": 53,
    "predicate": "connects_to",
    "object_id": 688,
    "weight": 1
  },
  {
    "id": 332,
    "subject_id": 54,
    "predicate": "connects_to",
    "object_id": 689,
    "weight": 1
  },
  {
    "id": 333,
    "subject_id": 65,
    "predicate": "connects_to",
    "object_id": 690,
    "weight": 1
  },
  {
    "id": 334,
    "subject_id": 321,
    "predicate": "connects_to",
    "object_id": 320,
    "weight": 1
  },
  {
    "id": 335,
    "subject_id": 145,
    "predicate": "connects_to",
    "object_id": 692,
    "weight": 1
  },
  {
    "id": 336,
    "subject_id": 195,
    "predicate": "connects_to",
    "object_id": 693,
    "weight": 1
  },
  {
    "id": 337,
    "subject_id": 62,
    "predicate": "connects_to",
    "object_id": 72,
    "weight": 1
  },
  {
    "id": 338,
    "subject_id": 9,
    "predicate": "connects_to",
    "object_id": 695,
    "weight": 1
  },
  {
    "id": 339,
    "subject_id": 647,
    "predicate": "connects_to",
    "object_id": 664,
    "weight": 1
  },
  {
    "id": 340,
    "subject_id": 648,
    "predicate": "connects_to",
    "object_id": 697,
    "weight": 1
  },
  {
    "id": 341,
    "subject_id": 649,
    "predicate": "connects_to",
    "object_id": 698,
    "weight": 1
  },
  {
    "id": 342,
    "subject_id": 650,
    "predicate": "connects_to",
    "object_id": 699,
    "weight": 1
  },
  {
    "id": 343,
    "subject_id": 651,
    "predicate": "connects_to",
    "object_id": 700,
    "weight": 1
  },
  {
    "id": 344,
    "subject_id": 652,
    "predicate": "connects_to",
    "object_id": 701,
    "weight": 1
  },
  {
    "id": 345,
    "subject_id": 653,
    "predicate": "connects_to",
    "object_id": 702,
    "weight": 1
  },
  {
    "id": 346,
    "subject_id": 654,
    "predicate": "connects_to",
    "object_id": 703,
    "weight": 1
  },
  {
    "id": 347,
    "subject_id": 655,
    "predicate": "connects_to",
    "object_id": 704,
    "weight": 1
  },
  {
    "id": 348,
    "subject_id": 74,
    "predicate": "connects_to",
    "object_id": 705,
    "weight": 1
  },
  {
    "id": 349,
    "subject_id": 657,
    "predicate": "connects_to",
    "object_id": 706,
    "weight": 1
  },
  {
    "id": 350,
    "subject_id": 658,
    "predicate": "is",
    "object_id": 707,
    "weight": 1
  },
  {
    "id": 351,
    "subject_id": 659,
    "predicate": "is",
    "object_id": 708,
    "weight": 1
  },
  {
    "id": 352,
    "subject_id": 660,
    "predicate": "is",
    "object_id": 709,
    "weight": 1
  },
  {
    "id": 353,
    "subject_id": 661,
    "predicate": "is",
    "object_id": 710,
    "weight": 1
  },
  {
    "id": 354,
    "subject_id": 662,
    "predicate": "is",
    "object_id": 711,
    "weight": 1
  },
  {
    "id": 355,
    "subject_id": 663,
    "predicate": "is",
    "object_id": 712,
    "weight": 1
  },
  {
    "id": 356,
    "subject_id": 664,
    "predicate": "is",
    "object_id": 713,
    "weight": 1
  },
  {
    "id": 357,
    "subject_id": 665,
    "predicate": "is",
    "object_id": 714,
    "weight": 1
  },
  {
    "id": 358,
    "subject_id": 53,
    "predicate": "is",
    "object_id": 97,
    "weight": 1
  },
  {
    "id": 359,
    "subject_id": 54,
    "predicate": "is",
    "object_id": 98,
    "weight": 1
  },
  {
    "id": 360,
    "subject_id": 55,
    "predicate": "is",
    "object_id": 99,
    "weight": 1
  },
  {
    "id": 361,
    "subject_id": 56,
    "predicate": "is",
    "object_id": 100,
    "weight": 1
  },
  {
    "id": 362,
    "subject_id": 57,
    "predicate": "is",
    "object_id": 101,
    "weight": 1
  },
  {
    "id": 363,
    "subject_id": 58,
    "predicate": "is",
    "object_id": 102,
    "weight": 1
  },
  {
    "id": 364,
    "subject_id": 59,
    "predicate": "is",
    "object_id": 103,
    "weight": 1
  },
  {
    "id": 365,
    "subject_id": 60,
    "predicate": "is",
    "object_id": 104,
    "weight": 1
  },
  {
    "id": 366,
    "subject_id": 61,
    "predicate": "is",
    "object_id": 105,
    "weight": 1
  },
  {
    "id": 367,
    "subject_id": 724,
    "predicate": "is",
    "object_id": 796,
    "weight": 1
  },
  {
    "id": 368,
    "subject_id": 725,
    "predicate": "is",
    "object_id": 797,
    "weight": 1
  },
  {
    "id": 369,
    "subject_id": 726,
    "predicate": "is",
    "object_id": 798,
    "weight": 1
  },
  {
    "id": 370,
    "subject_id": 727,
    "predicate": "is",
    "object_id": 799,
    "weight": 1
  },
  {
    "id": 371,
    "subject_id": 728,
    "predicate": "is",
    "object_id": 800,
    "weight": 1
  },
  {
    "id": 372,
    "subject_id": 706,
    "predicate": "is",
    "object_id": 801,
    "weight": 1
  },
  {
    "id": 373,
    "subject_id": 730,
    "predicate": "is",
    "object_id": 802,
    "weight": 1
  },
  {
    "id": 374,
    "subject_id": 731,
    "predicate": "is",
    "object_id": 803,
    "weight": 1
  },
  {
    "id": 375,
    "subject_id": 517,
    "predicate": "is",
    "object_id": 804,
    "weight": 1
  },
  {
    "id": 376,
    "subject_id": 454,
    "predicate": "is",
    "object_id": 805,
    "weight": 1
  },
  {
    "id": 377,
    "subject_id": 448,
    "predicate": "is",
    "object_id": 806,
    "weight": 1
  },
  {
    "id": 378,
    "subject_id": 446,
    "predicate": "is",
    "object_id": 807,
    "weight": 1
  },
  {
    "id": 379,
    "subject_id": 736,
    "predicate": "is",
    "object_id": 808,
    "weight": 1
  },
  {
    "id": 380,
    "subject_id": 69,
    "predicate": "is",
    "object_id": 809,
    "weight": 1
  },
  {
    "id": 381,
    "subject_id": 738,
    "predicate": "is",
    "object_id": 810,
    "weight": 1
  },
  {
    "id": 382,
    "subject_id": 739,
    "predicate": "is",
    "object_id": 811,
    "weight": 1
  },
  {
    "id": 383,
    "subject_id": 740,
    "predicate": "is",
    "object_id": 812,
    "weight": 1
  },
  {
    "id": 384,
    "subject_id": 741,
    "predicate": "is",
    "object_id": 813,
    "weight": 1
  },
  {
    "id": 385,
    "subject_id": 742,
    "predicate": "is",
    "object_id": 814,
    "weight": 1
  },
  {
    "id": 386,
    "subject_id": 743,
    "predicate": "is",
    "object_id": 815,
    "weight": 1
  },
  {
    "id": 387,
    "subject_id": 744,
    "predicate": "is",
    "object_id": 816,
    "weight": 1
  },
  {
    "id": 388,
    "subject_id": 745,
    "predicate": "is",
    "object_id": 817,
    "weight": 1
  },
  {
    "id": 389,
    "subject_id": 746,
    "predicate": "is",
    "object_id": 818,
    "weight": 1
  },
  {
    "id": 390,
    "subject_id": 747,
    "predicate": "is",
    "object_id": 819,
    "weight": 1
  },
  {
    "id": 391,
    "subject_id": 748,
    "predicate": "is",
    "object_id": 820,
    "weight": 1
  },
  {
    "id": 392,
    "subject_id": 749,
    "predicate": "is",
    "object_id": 821,
    "weight": 1
  },
  {
    "id": 393,
    "subject_id": 750,
    "predicate": "is",
    "object_id": 822,
    "weight": 1
  },
  {
    "id": 394,
    "subject_id": 751,
    "predicate": "is",
    "object_id": 823,
    "weight": 1
  },
  {
    "id": 395,
    "subject_id": 752,
    "predicate": "is",
    "object_id": 824,
    "weight": 1
  },
  {
    "id": 396,
    "subject_id": 753,
    "predicate": "is",
    "object_id": 825,
    "weight": 1
  },
  {
    "id": 397,
    "subject_id": 754,
    "predicate": "is",
    "object_id": 826,
    "weight": 1
  },
  {
    "id": 398,
    "subject_id": 755,
    "predicate": "is",
    "object_id": 827,
    "weight": 1
  },
  {
    "id": 399,
    "subject_id": 756,
    "predicate": "is",
    "object_id": 828,
    "weight": 1
  },
  {
    "id": 400,
    "subject_id": 757,
    "predicate": "is",
    "object_id": 829,
    "weight": 1
  },
  {
    "id": 401,
    "subject_id": 758,
    "predicate": "is",
    "object_id": 830,
    "weight": 1
  },
  {
    "id": 402,
    "subject_id": 759,
    "predicate": "is",
    "object_id": 831,
    "weight": 1
  },
  {
    "id": 403,
    "subject_id": 760,
    "predicate": "is",
    "object_id": 832,
    "weight": 1
  },
  {
    "id": 404,
    "subject_id": 761,
    "predicate": "is",
    "object_id": 833,
    "weight": 1
  },
  {
    "id": 405,
    "subject_id": 762,
    "predicate": "is",
    "object_id": 834,
    "weight": 1
  },
  {
    "id": 406,
    "subject_id": 159,
    "predicate": "is",
    "object_id": 835,
    "weight": 1
  },
  {
    "id": 407,
    "subject_id": 764,
    "predicate": "is",
    "object_id": 836,
    "weight": 1
  },
  {
    "id": 408,
    "subject_id": 765,
    "predicate": "is",
    "object_id": 837,
    "weight": 1
  },
  {
    "id": 409,
    "subject_id": 766,
    "predicate": "is",
    "object_id": 838,
    "weight": 1
  },
  {
    "id": 410,
    "subject_id": 767,
    "predicate": "is",
    "object_id": 839,
    "weight": 1
  },
  {
    "id": 411,
    "subject_id": 768,
    "predicate": "is",
    "object_id": 840,
    "weight": 1
  },
  {
    "id": 412,
    "subject_id": 769,
    "predicate": "is",
    "object_id": 841,
    "weight": 1
  },
  {
    "id": 413,
    "subject_id": 770,
    "predicate": "is",
    "object_id": 842,
    "weight": 1
  },
  {
    "id": 414,
    "subject_id": 771,
    "predicate": "is",
    "object_id": 843,
    "weight": 1
  },
  {
    "id": 415,
    "subject_id": 772,
    "predicate": "is",
    "object_id": 844,
    "weight": 1
  },
  {
    "id": 416,
    "subject_id": 773,
    "predicate": "is",
    "object_id": 845,
    "weight": 1
  },
  {
    "id": 417,
    "subject_id": 774,
    "predicate": "is",
    "object_id": 846,
    "weight": 1
  },
  {
    "id": 418,
    "subject_id": 775,
    "predicate": "is",
    "object_id": 847,
    "weight": 1
  },
  {
    "id": 419,
    "subject_id": 776,
    "predicate": "is",
    "object_id": 848,
    "weight": 1
  },
  {
    "id": 420,
    "subject_id": 777,
    "predicate": "is",
    "object_id": 849,
    "weight": 1
  },
  {
    "id": 421,
    "subject_id": 778,
    "predicate": "is",
    "object_id": 850,
    "weight": 1
  },
  {
    "id": 422,
    "subject_id": 779,
    "predicate": "is",
    "object_id": 851,
    "weight": 1
  },
  {
    "id": 423,
    "subject_id": 780,
    "predicate": "is",
    "object_id": 852,
    "weight": 1
  },
  {
    "id": 424,
    "subject_id": 781,
    "predicate": "is",
    "object_id": 853,
    "weight": 1
  },
  {
    "id": 425,
    "subject_id": 782,
    "predicate": "is",
    "object_id": 854,
    "weight": 1
  },
  {
    "id": 426,
    "subject_id": 783,
    "predicate": "is",
    "object_id": 855,
    "weight": 1
  },
  {
    "id": 427,
    "subject_id": 784,
    "predicate": "is",
    "object_id": 856,
    "weight": 1
  },
  {
    "id": 428,
    "subject_id": 785,
    "predicate": "is",
    "object_id": 857,
    "weight": 1
  },
  {
    "id": 429,
    "subject_id": 786,
    "predicate": "is",
    "object_id": 858,
    "weight": 1
  },
  {
    "id": 430,
    "subject_id": 859,
    "predicate": "is",
    "object_id": 930,
    "weight": 1
  },
  {
    "id": 431,
    "subject_id": 860,
    "predicate": "is",
    "object_id": 931,
    "weight": 1
  },
  {
    "id": 432,
    "subject_id": 861,
    "predicate": "is",
    "object_id": 932,
    "weight": 1
  },
  {
    "id": 433,
    "subject_id": 862,
    "predicate": "is",
    "object_id": 933,
    "weight": 1
  },
  {
    "id": 434,
    "subject_id": 863,
    "predicate": "is",
    "object_id": 934,
    "weight": 1
  },
  {
    "id": 435,
    "subject_id": 864,
    "predicate": "is",
    "object_id": 935,
    "weight": 1
  },
  {
    "id": 436,
    "subject_id": 865,
    "predicate": "is",
    "object_id": 936,
    "weight": 1
  },
  {
    "id": 437,
    "subject_id": 866,
    "predicate": "is",
    "object_id": 937,
    "weight": 1
  },
  {
    "id": 438,
    "subject_id": 867,
    "predicate": "is",
    "object_id": 938,
    "weight": 1
  },
  {
    "id": 439,
    "subject_id": 868,
    "predicate": "is",
    "object_id": 935,
    "weight": 1
  },
  {
    "id": 440,
    "subject_id": 869,
    "predicate": "is",
    "object_id": 940,
    "weight": 1
  },
  {
    "id": 441,
    "subject_id": 870,
    "predicate": "is",
    "object_id": 935,
    "weight": 1
  },
  {
    "id": 442,
    "subject_id": 871,
    "predicate": "is",
    "object_id": 942,
    "weight": 1
  },
  {
    "id": 443,
    "subject_id": 872,
    "predicate": "is",
    "object_id": 943,
    "weight": 1
  },
  {
    "id": 444,
    "subject_id": 873,
    "predicate": "is",
    "object_id": 944,
    "weight": 1
  },
  {
    "id": 445,
    "subject_id": 874,
    "predicate": "is",
    "object_id": 945,
    "weight": 1
  },
  {
    "id": 446,
    "subject_id": 875,
    "predicate": "is",
    "object_id": 946,
    "weight": 1
  },
  {
    "id": 447,
    "subject_id": 876,
    "predicate": "is",
    "object_id": 947,
    "weight": 1
  },
  {
    "id": 448,
    "subject_id": 877,
    "predicate": "is",
    "object_id": 948,
    "weight": 1
  },
  {
    "id": 449,
    "subject_id": 878,
    "predicate": "is",
    "object_id": 949,
    "weight": 1
  },
  {
    "id": 450,
    "subject_id": 879,
    "predicate": "is",
    "object_id": 950,
    "weight": 1
  },
  {
    "id": 451,
    "subject_id": 880,
    "predicate": "is",
    "object_id": 951,
    "weight": 1
  },
  {
    "id": 452,
    "subject_id": 881,
    "predicate": "is",
    "object_id": 952,
    "weight": 1
  },
  {
    "id": 453,
    "subject_id": 882,
    "predicate": "is",
    "object_id": 953,
    "weight": 1
  },
  {
    "id": 454,
    "subject_id": 883,
    "predicate": "is",
    "object_id": 954,
    "weight": 1
  },
  {
    "id": 455,
    "subject_id": 884,
    "predicate": "is",
    "object_id": 955,
    "weight": 1
  },
  {
    "id": 456,
    "subject_id": 885,
    "predicate": "is",
    "object_id": 956,
    "weight": 1
  },
  {
    "id": 457,
    "subject_id": 886,
    "predicate": "is",
    "object_id": 957,
    "weight": 1
  },
  {
    "id": 458,
    "subject_id": 887,
    "predicate": "is",
    "object_id": 958,
    "weight": 1
  },
  {
    "id": 459,
    "subject_id": 888,
    "predicate": "is",
    "object_id": 959,
    "weight": 1
  },
  {
    "id": 460,
    "subject_id": 889,
    "predicate": "is",
    "object_id": 960,
    "weight": 1
  },
  {
    "id": 461,
    "subject_id": 890,
    "predicate": "is",
    "object_id": 961,
    "weight": 1
  },
  {
    "id": 462,
    "subject_id": 891,
    "predicate": "is",
    "object_id": 962,
    "weight": 1
  },
  {
    "id": 463,
    "subject_id": 892,
    "predicate": "is",
    "object_id": 963,
    "weight": 1
  },
  {
    "id": 464,
    "subject_id": 893,
    "predicate": "is",
    "object_id": 964,
    "weight": 1
  },
  {
    "id": 465,
    "subject_id": 894,
    "predicate": "is",
    "object_id": 965,
    "weight": 1
  },
  {
    "id": 466,
    "subject_id": 895,
    "predicate": "is",
    "object_id": 966,
    "weight": 1
  },
  {
    "id": 467,
    "subject_id": 896,
    "predicate": "is",
    "object_id": 967,
    "weight": 1
  },
  {
    "id": 468,
    "subject_id": 897,
    "predicate": "is",
    "object_id": 968,
    "weight": 1
  },
  {
    "id": 469,
    "subject_id": 898,
    "predicate": "is",
    "object_id": 969,
    "weight": 1
  },
  {
    "id": 470,
    "subject_id": 899,
    "predicate": "is",
    "object_id": 970,
    "weight": 1
  },
  {
    "id": 471,
    "subject_id": 900,
    "predicate": "is",
    "object_id": 971,
    "weight": 1
  },
  {
    "id": 472,
    "subject_id": 901,
    "predicate": "is",
    "object_id": 972,
    "weight": 1
  },
  {
    "id": 473,
    "subject_id": 902,
    "predicate": "is",
    "object_id": 973,
    "weight": 1
  },
  {
    "id": 474,
    "subject_id": 903,
    "predicate": "is",
    "object_id": 974,
    "weight": 1
  },
  {
    "id": 475,
    "subject_id": 904,
    "predicate": "is",
    "object_id": 975,
    "weight": 1
  },
  {
    "id": 476,
    "subject_id": 905,
    "predicate": "is",
    "object_id": 976,
    "weight": 1
  },
  {
    "id": 477,
    "subject_id": 906,
    "predicate": "is",
    "object_id": 977,
    "weight": 1
  },
  {
    "id": 478,
    "subject_id": 907,
    "predicate": "is",
    "object_id": 978,
    "weight": 1
  },
  {
    "id": 479,
    "subject_id": 908,
    "predicate": "is",
    "object_id": 979,
    "weight": 1
  },
  {
    "id": 480,
    "subject_id": 909,
    "predicate": "is",
    "object_id": 980,
    "weight": 1
  },
  {
    "id": 481,
    "subject_id": 910,
    "predicate": "is",
    "object_id": 981,
    "weight": 1
  },
  {
    "id": 482,
    "subject_id": 911,
    "predicate": "is",
    "object_id": 982,
    "weight": 1
  },
  {
    "id": 483,
    "subject_id": 912,
    "predicate": "is",
    "object_id": 983,
    "weight": 1
  },
  {
    "id": 484,
    "subject_id": 913,
    "predicate": "is",
    "object_id": 984,
    "weight": 1
  },
  {
    "id": 485,
    "subject_id": 914,
    "predicate": "is",
    "object_id": 985,
    "weight": 1
  },
  {
    "id": 486,
    "subject_id": 915,
    "predicate": "is",
    "object_id": 986,
    "weight": 1
  },
  {
    "id": 487,
    "subject_id": 916,
    "predicate": "is",
    "object_id": 987,
    "weight": 1
  },
  {
    "id": 488,
    "subject_id": 917,
    "predicate": "is",
    "object_id": 988,
    "weight": 1
  },
  {
    "id": 489,
    "subject_id": 918,
    "predicate": "is",
    "object_id": 989,
    "weight": 1
  },
  {
    "id": 490,
    "subject_id": 919,
    "predicate": "is",
    "object_id": 990,
    "weight": 1
  },
  {
    "id": 491,
    "subject_id": 920,
    "predicate": "is",
    "object_id": 991,
    "weight": 1
  },
  {
    "id": 492,
    "subject_id": 921,
    "predicate": "is",
    "object_id": 992,
    "weight": 1
  },
  {
    "id": 493,
    "subject_id": 922,
    "predicate": "is",
    "object_id": 993,
    "weight": 1
  },
  {
    "id": 494,
    "subject_id": 923,
    "predicate": "is",
    "object_id": 994,
    "weight": 1
  },
  {
    "id": 495,
    "subject_id": 924,
    "predicate": "is",
    "object_id": 995,
    "weight": 1
  },
  {
    "id": 496,
    "subject_id": 925,
    "predicate": "is",
    "object_id": 996,
    "weight": 1
  },
  {
    "id": 497,
    "subject_id": 926,
    "predicate": "is",
    "object_id": 997,
    "weight": 1
  },
  {
    "id": 498,
    "subject_id": 927,
    "predicate": "is",
    "object_id": 998,
    "weight": 1
  },
  {
    "id": 499,
    "subject_id": 928,
    "predicate": "is",
    "object_id": 999,
    "weight": 1
  },
  {
    "id": 500,
    "subject_id": 929,
    "predicate": "is",
    "object_id": 1000,
    "weight": 1
  },
  {
    "id": 501,
    "subject_id": 1001,
    "predicate": "is",
    "object_id": 1071,
    "weight": 1
  },
  {
    "id": 502,
    "subject_id": 1002,
    "predicate": "is",
    "object_id": 1072,
    "weight": 1
  },
  {
    "id": 503,
    "subject_id": 1003,
    "predicate": "is",
    "object_id": 1073,
    "weight": 1
  },
  {
    "id": 504,
    "subject_id": 1004,
    "predicate": "is",
    "object_id": 1074,
    "weight": 1
  },
  {
    "id": 505,
    "subject_id": 1005,
    "predicate": "is",
    "object_id": 1075,
    "weight": 1
  },
  {
    "id": 506,
    "subject_id": 1006,
    "predicate": "is",
    "object_id": 1076,
    "weight": 1
  },
  {
    "id": 507,
    "subject_id": 1007,
    "predicate": "is",
    "object_id": 1077,
    "weight": 1
  },
  {
    "id": 508,
    "subject_id": 1008,
    "predicate": "is",
    "object_id": 1078,
    "weight": 1
  },
  {
    "id": 509,
    "subject_id": 1009,
    "predicate": "is",
    "object_id": 1079,
    "weight": 1
  },
  {
    "id": 510,
    "subject_id": 1010,
    "predicate": "is",
    "object_id": 1080,
    "weight": 1
  },
  {
    "id": 511,
    "subject_id": 1011,
    "predicate": "is",
    "object_id": 1081,
    "weight": 1
  },
  {
    "id": 512,
    "subject_id": 1012,
    "predicate": "is",
    "object_id": 1082,
    "weight": 1
  },
  {
    "id": 513,
    "subject_id": 1013,
    "predicate": "is",
    "object_id": 1083,
    "weight": 1
  },
  {
    "id": 514,
    "subject_id": 1014,
    "predicate": "is",
    "object_id": 1084,
    "weight": 1
  },
  {
    "id": 515,
    "subject_id": 1015,
    "predicate": "is",
    "object_id": 1085,
    "weight": 1
  },
  {
    "id": 516,
    "subject_id": 1016,
    "predicate": "is",
    "object_id": 1086,
    "weight": 1
  },
  {
    "id": 517,
    "subject_id": 1017,
    "predicate": "is",
    "object_id": 1087,
    "weight": 1
  },
  {
    "id": 518,
    "subject_id": 1018,
    "predicate": "is",
    "object_id": 1088,
    "weight": 1
  },
  {
    "id": 519,
    "subject_id": 1019,
    "predicate": "is",
    "object_id": 1089,
    "weight": 1
  },
  {
    "id": 520,
    "subject_id": 1020,
    "predicate": "is",
    "object_id": 1090,
    "weight": 1
  },
  {
    "id": 521,
    "subject_id": 1021,
    "predicate": "is",
    "object_id": 1091,
    "weight": 1
  },
  {
    "id": 522,
    "subject_id": 1022,
    "predicate": "is",
    "object_id": 1092,
    "weight": 1
  },
  {
    "id": 523,
    "subject_id": 1023,
    "predicate": "is",
    "object_id": 1093,
    "weight": 1
  },
  {
    "id": 524,
    "subject_id": 1024,
    "predicate": "is",
    "object_id": 1094,
    "weight": 1
  },
  {
    "id": 525,
    "subject_id": 1025,
    "predicate": "is",
    "object_id": 1095,
    "weight": 1
  },
  {
    "id": 526,
    "subject_id": 1026,
    "predicate": "is",
    "object_id": 1096,
    "weight": 1
  },
  {
    "id": 527,
    "subject_id": 1027,
    "predicate": "is",
    "object_id": 1097,
    "weight": 1
  },
  {
    "id": 528,
    "subject_id": 1028,
    "predicate": "is",
    "object_id": 1098,
    "weight": 1
  },
  {
    "id": 529,
    "subject_id": 1029,
    "predicate": "is",
    "object_id": 1099,
    "weight": 1
  },
  {
    "id": 530,
    "subject_id": 1030,
    "predicate": "is",
    "object_id": 1100,
    "weight": 1
  },
  {
    "id": 531,
    "subject_id": 1031,
    "predicate": "is",
    "object_id": 1101,
    "weight": 1
  },
  {
    "id": 532,
    "subject_id": 1032,
    "predicate": "is",
    "object_id": 1102,
    "weight": 1
  },
  {
    "id": 533,
    "subject_id": 1033,
    "predicate": "is",
    "object_id": 1103,
    "weight": 1
  },
  {
    "id": 534,
    "subject_id": 1034,
    "predicate": "is",
    "object_id": 1104,
    "weight": 1
  },
  {
    "id": 535,
    "subject_id": 1035,
    "predicate": "is",
    "object_id": 1105,
    "weight": 1
  },
  {
    "id": 536,
    "subject_id": 1036,
    "predicate": "is",
    "object_id": 1106,
    "weight": 1
  },
  {
    "id": 537,
    "subject_id": 1037,
    "predicate": "is",
    "object_id": 1107,
    "weight": 1
  },
  {
    "id": 538,
    "subject_id": 1038,
    "predicate": "is",
    "object_id": 1108,
    "weight": 1
  },
  {
    "id": 539,
    "subject_id": 1039,
    "predicate": "is",
    "object_id": 1109,
    "weight": 1
  },
  {
    "id": 540,
    "subject_id": 1040,
    "predicate": "is",
    "object_id": 1110,
    "weight": 1
  },
  {
    "id": 541,
    "subject_id": 1041,
    "predicate": "is",
    "object_id": 1111,
    "weight": 1
  },
  {
    "id": 542,
    "subject_id": 1042,
    "predicate": "is",
    "object_id": 1112,
    "weight": 1
  },
  {
    "id": 543,
    "subject_id": 1043,
    "predicate": "is",
    "object_id": 1113,
    "weight": 1
  },
  {
    "id": 544,
    "subject_id": 1044,
    "predicate": "is",
    "object_id": 1114,
    "weight": 1
  },
  {
    "id": 545,
    "subject_id": 1045,
    "predicate": "is",
    "object_id": 1115,
    "weight": 1
  },
  {
    "id": 546,
    "subject_id": 1046,
    "predicate": "is",
    "object_id": 1116,
    "weight": 1
  },
  {
    "id": 547,
    "subject_id": 1047,
    "predicate": "is",
    "object_id": 1117,
    "weight": 1
  },
  {
    "id": 548,
    "subject_id": 1048,
    "predicate": "is",
    "object_id": 1118,
    "weight": 1
  },
  {
    "id": 549,
    "subject_id": 1049,
    "predicate": "is",
    "object_id": 1119,
    "weight": 1
  },
  {
    "id": 550,
    "subject_id": 1050,
    "predicate": "is",
    "object_id": 1120,
    "weight": 1
  },
  {
    "id": 551,
    "subject_id": 1051,
    "predicate": "is",
    "object_id": 1121,
    "weight": 1
  },
  {
    "id": 552,
    "subject_id": 1052,
    "predicate": "is",
    "object_id": 1122,
    "weight": 1
  },
  {
    "id": 553,
    "subject_id": 1053,
    "predicate": "is",
    "object_id": 1123,
    "weight": 1
  },
  {
    "id": 554,
    "subject_id": 1054,
    "predicate": "is",
    "object_id": 1124,
    "weight": 1
  },
  {
    "id": 555,
    "subject_id": 1055,
    "predicate": "is",
    "object_id": 1125,
    "weight": 1
  },
  {
    "id": 556,
    "subject_id": 1056,
    "predicate": "is",
    "object_id": 1126,
    "weight": 1
  },
  {
    "id": 557,
    "subject_id": 1057,
    "predicate": "is",
    "object_id": 1127,
    "weight": 1
  },
  {
    "id": 558,
    "subject_id": 1058,
    "predicate": "is",
    "object_id": 1128,
    "weight": 1
  },
  {
    "id": 559,
    "subject_id": 1059,
    "predicate": "is",
    "object_id": 1129,
    "weight": 1
  },
  {
    "id": 560,
    "subject_id": 1060,
    "predicate": "is",
    "object_id": 1130,
    "weight": 1
  },
  {
    "id": 561,
    "subject_id": 1061,
    "predicate": "is",
    "object_id": 1131,
    "weight": 1
  },
  {
    "id": 562,
    "subject_id": 1062,
    "predicate": "is",
    "object_id": 1132,
    "weight": 1
  },
  {
    "id": 563,
    "subject_id": 1063,
    "predicate": "is",
    "object_id": 1133,
    "weight": 1
  },
  {
    "id": 564,
    "subject_id": 1064,
    "predicate": "is",
    "object_id": 1134,
    "weight": 1
  },
  {
    "id": 565,
    "subject_id": 1065,
    "predicate": "is",
    "object_id": 1135,
    "weight": 1
  },
  {
    "id": 566,
    "subject_id": 1066,
    "predicate": "is",
    "object_id": 1136,
    "weight": 1
  },
  {
    "id": 567,
    "subject_id": 1067,
    "predicate": "is",
    "object_id": 1137,
    "weight": 1
  },
  {
    "id": 568,
    "subject_id": 1068,
    "predicate": "Compound",
    "object_id": 1138,
    "weight": 1
  },
  {
    "id": 569,
    "subject_id": 1069,
    "predicate": "Entry",
    "object_id": 1139,
    "weight": 1
  },
  {
    "id": 570,
    "subject_id": 1070,
    "predicate": "Record",
    "object_id": 1140,
    "weight": 1
  },
  {
    "id": 571,
    "subject_id": 1141,
    "predicate": "Entry",
    "object_id": 1211,
    "weight": 1
  },
  {
    "id": 572,
    "subject_id": 1142,
    "predicate": "Record",
    "object_id": 1212,
    "weight": 1
  },
  {
    "id": 573,
    "subject_id": 1143,
    "predicate": "is",
    "object_id": 1213,
    "weight": 1
  },
  {
    "id": 574,
    "subject_id": 1144,
    "predicate": "Dataset",
    "object_id": 1214,
    "weight": 1
  },
  {
    "id": 575,
    "subject_id": 1145,
    "predicate": "Dataset",
    "object_id": 1215,
    "weight": 1
  },
  {
    "id": 576,
    "subject_id": 1146,
    "predicate": "Project",
    "object_id": 1216,
    "weight": 1
  },
  {
    "id": 577,
    "subject_id": 1147,
    "predicate": "Project",
    "object_id": 1217,
    "weight": 1
  },
  {
    "id": 578,
    "subject_id": 1148,
    "predicate": "is",
    "object_id": 1218,
    "weight": 1
  },
  {
    "id": 579,
    "subject_id": 1149,
    "predicate": "is",
    "object_id": 1219,
    "weight": 1
  },
  {
    "id": 580,
    "subject_id": 1150,
    "predicate": "is",
    "object_id": 1220,
    "weight": 1
  },
  {
    "id": 581,
    "subject_id": 1151,
    "predicate": "is",
    "object_id": 1221,
    "weight": 1
  },
  {
    "id": 582,
    "subject_id": 1152,
    "predicate": "Study",
    "object_id": 1222,
    "weight": 1
  },
  {
    "id": 583,
    "subject_id": 1153,
    "predicate": "is",
    "object_id": 1223,
    "weight": 1
  },
  {
    "id": 584,
    "subject_id": 1154,
    "predicate": "is",
    "object_id": 1224,
    "weight": 1
  },
  {
    "id": 585,
    "subject_id": 1155,
    "predicate": "is",
    "object_id": 1225,
    "weight": 1
  },
  {
    "id": 586,
    "subject_id": 1156,
    "predicate": "is",
    "object_id": 1226,
    "weight": 1
  },
  {
    "id": 587,
    "subject_id": 1157,
    "predicate": "is",
    "object_id": 1227,
    "weight": 1
  },
  {
    "id": 588,
    "subject_id": 1158,
    "predicate": "is",
    "object_id": 1228,
    "weight": 1
  },
  {
    "id": 589,
    "subject_id": 1159,
    "predicate": "is",
    "object_id": 1229,
    "weight": 1
  },
  {
    "id": 590,
    "subject_id": 1160,
    "predicate": "is",
    "object_id": 1230,
    "weight": 1
  },
  {
    "id": 591,
    "subject_id": 1161,
    "predicate": "is",
    "object_id": 1231,
    "weight": 1
  },
  {
    "id": 592,
    "subject_id": 1162,
    "predicate": "is",
    "object_id": 1232,
    "weight": 1
  },
  {
    "id": 593,
    "subject_id": 1163,
    "predicate": "is",
    "object_id": 1233,
    "weight": 1
  },
  {
    "id": 594,
    "subject_id": 1164,
    "predicate": "is",
    "object_id": 1234,
    "weight": 1
  },
  {
    "id": 595,
    "subject_id": 1165,
    "predicate": "is",
    "object_id": 1235,
    "weight": 1
  },
  {
    "id": 596,
    "subject_id": 1166,
    "predicate": "is",
    "object_id": 1236,
    "weight": 1
  },
  {
    "id": 597,
    "subject_id": 1167,
    "predicate": "is",
    "object_id": 1237,
    "weight": 1
  },
  {
    "id": 598,
    "subject_id": 1168,
    "predicate": "is",
    "object_id": 1238,
    "weight": 1
  },
  {
    "id": 599,
    "subject_id": 1169,
    "predicate": "is",
    "object_id": 1239,
    "weight": 1
  },
  {
    "id": 600,
    "subject_id": 1170,
    "predicate": "is",
    "object_id": 1240,
    "weight": 1
  },
  {
    "id": 601,
    "subject_id": 1171,
    "predicate": "is",
    "object_id": 1241,
    "weight": 1
  },
  {
    "id": 602,
    "subject_id": 1172,
    "predicate": "is",
    "object_id": 1242,
    "weight": 1
  },
  {
    "id": 603,
    "subject_id": 1173,
    "predicate": "is",
    "object_id": 1243,
    "weight": 1
  },
  {
    "id": 604,
    "subject_id": 1174,
    "predicate": "is",
    "object_id": 1244,
    "weight": 1
  },
  {
    "id": 605,
    "subject_id": 1175,
    "predicate": "is",
    "object_id": 1245,
    "weight": 1
  },
  {
    "id": 606,
    "subject_id": 1176,
    "predicate": "is",
    "object_id": 1246,
    "weight": 1
  },
  {
    "id": 607,
    "subject_id": 1177,
    "predicate": "is",
    "object_id": 1247,
    "weight": 1
  },
  {
    "id": 608,
    "subject_id": 1178,
    "predicate": "is",
    "object_id": 1248,
    "weight": 1
  },
  {
    "id": 609,
    "subject_id": 1179,
    "predicate": "is",
    "object_id": 1249,
    "weight": 1
  },
  {
    "id": 610,
    "subject_id": 1180,
    "predicate": "is",
    "object_id": 1250,
    "weight": 1
  },
  {
    "id": 611,
    "subject_id": 1181,
    "predicate": "is",
    "object_id": 1251,
    "weight": 1
  },
  {
    "id": 612,
    "subject_id": 1182,
    "predicate": "is",
    "object_id": 1252,
    "weight": 1
  },
  {
    "id": 613,
    "subject_id": 1183,
    "predicate": "is",
    "object_id": 1253,
    "weight": 1
  },
  {
    "id": 614,
    "subject_id": 1184,
    "predicate": "is",
    "object_id": 1254,
    "weight": 1
  },
  {
    "id": 615,
    "subject_id": 1185,
    "predicate": "is",
    "object_id": 1255,
    "weight": 1
  },
  {
    "id": 616,
    "subject_id": 1186,
    "predicate": "is",
    "object_id": 1256,
    "weight": 1
  },
  {
    "id": 617,
    "subject_id": 1187,
    "predicate": "is",
    "object_id": 1257,
    "weight": 1
  },
  {
    "id": 618,
    "subject_id": 1188,
    "predicate": "is",
    "object_id": 1258,
    "weight": 1
  },
  {
    "id": 619,
    "subject_id": 1189,
    "predicate": "is",
    "object_id": 1259,
    "weight": 1
  },
  {
    "id": 620,
    "subject_id": 1190,
    "predicate": "is",
    "object_id": 1260,
    "weight": 1
  },
  {
    "id": 621,
    "subject_id": 1191,
    "predicate": "is",
    "object_id": 1261,
    "weight": 1
  },
  {
    "id": 622,
    "subject_id": 1192,
    "predicate": "is",
    "object_id": 1262,
    "weight": 1
  },
  {
    "id": 623,
    "subject_id": 1193,
    "predicate": "is",
    "object_id": 1263,
    "weight": 1
  },
  {
    "id": 624,
    "subject_id": 1194,
    "predicate": "is",
    "object_id": 1264,
    "weight": 1
  },
  {
    "id": 625,
    "subject_id": 1195,
    "predicate": "is",
    "object_id": 1265,
    "weight": 1
  },
  {
    "id": 626,
    "subject_id": 1196,
    "predicate": "is",
    "object_id": 1266,
    "weight": 1
  },
  {
    "id": 627,
    "subject_id": 1197,
    "predicate": "is",
    "object_id": 1267,
    "weight": 1
  },
  {
    "id": 628,
    "subject_id": 1198,
    "predicate": "is",
    "object_id": 1268,
    "weight": 1
  },
  {
    "id": 629,
    "subject_id": 1199,
    "predicate": "is",
    "object_id": 1269,
    "weight": 1
  },
  {
    "id": 630,
    "subject_id": 1200,
    "predicate": "is",
    "object_id": 1270,
    "weight": 1
  },
  {
    "id": 631,
    "subject_id": 1201,
    "predicate": "is",
    "object_id": 1271,
    "weight": 1
  },
  {
    "id": 632,
    "subject_id": 1202,
    "predicate": "is",
    "object_id": 1272,
    "weight": 1
  },
  {
    "id": 633,
    "subject_id": 1203,
    "predicate": "is",
    "object_id": 1273,
    "weight": 1
  },
  {
    "id": 634,
    "subject_id": 1204,
    "predicate": "is",
    "object_id": 1274,
    "weight": 1
  },
  {
    "id": 635,
    "subject_id": 1205,
    "predicate": "is",
    "object_id": 1275,
    "weight": 1
  },
  {
    "id": 636,
    "subject_id": 1206,
    "predicate": "is",
    "object_id": 1276,
    "weight": 1
  },
  {
    "id": 637,
    "subject_id": 1207,
    "predicate": "is",
    "object_id": 1277,
    "weight": 1
  },
  {
    "id": 638,
    "subject_id": 1208,
    "predicate": "is",
    "object_id": 1278,
    "weight": 1
  },
  {
    "id": 639,
    "subject_id": 1209,
    "predicate": "is",
    "object_id": 1279,
    "weight": 1
  },
  {
    "id": 640,
    "subject_id": 1210,
    "predicate": "is",
    "object_id": 1280,
    "weight": 1
  },
  {
    "id": 641,
    "subject_id": 1281,
    "predicate": "information_access_mechanismRetrieval_System",
    "object_id": 1353,
    "weight": 1
  },
  {
    "id": 642,
    "subject_id": 1282,
    "predicate": "is",
    "object_id": 1354,
    "weight": 1
  },
  {
    "id": 643,
    "subject_id": 1283,
    "predicate": "is",
    "object_id": 1355,
    "weight": 1
  },
  {
    "id": 644,
    "subject_id": 1284,
    "predicate": "is",
    "object_id": 1356,
    "weight": 1
  },
  {
    "id": 645,
    "subject_id": 1285,
    "predicate": "is",
    "object_id": 1357,
    "weight": 1
  },
  {
    "id": 646,
    "subject_id": 1286,
    "predicate": "is",
    "object_id": 1358,
    "weight": 1
  },
  {
    "id": 647,
    "subject_id": 1287,
    "predicate": "is",
    "object_id": 1359,
    "weight": 1
  },
  {
    "id": 648,
    "subject_id": 1288,
    "predicate": "is",
    "object_id": 1360,
    "weight": 1
  },
  {
    "id": 649,
    "subject_id": 1289,
    "predicate": "is",
    "object_id": 1361,
    "weight": 1
  },
  {
    "id": 650,
    "subject_id": 1290,
    "predicate": "is",
    "object_id": 1362,
    "weight": 1
  },
  {
    "id": 651,
    "subject_id": 1291,
    "predicate": "is",
    "object_id": 1363,
    "weight": 1
  },
  {
    "id": 652,
    "subject_id": 1292,
    "predicate": "is",
    "object_id": 1364,
    "weight": 1
  },
  {
    "id": 653,
    "subject_id": 1293,
    "predicate": "is",
    "object_id": 1365,
    "weight": 1
  },
  {
    "id": 654,
    "subject_id": 1294,
    "predicate": "is",
    "object_id": 1366,
    "weight": 1
  },
  {
    "id": 655,
    "subject_id": 1295,
    "predicate": "is",
    "object_id": 1367,
    "weight": 1
  },
  {
    "id": 656,
    "subject_id": 1296,
    "predicate": "is",
    "object_id": 1368,
    "weight": 1
  },
  {
    "id": 657,
    "subject_id": 1297,
    "predicate": "is",
    "object_id": 1369,
    "weight": 1
  },
  {
    "id": 658,
    "subject_id": 1298,
    "predicate": "is",
    "object_id": 1370,
    "weight": 1
  },
  {
    "id": 659,
    "subject_id": 1299,
    "predicate": "is",
    "object_id": 1371,
    "weight": 1
  },
  {
    "id": 660,
    "subject_id": 1300,
    "predicate": "is",
    "object_id": 1372,
    "weight": 1
  },
  {
    "id": 661,
    "subject_id": 1301,
    "predicate": "is",
    "object_id": 1373,
    "weight": 1
  },
  {
    "id": 662,
    "subject_id": 1302,
    "predicate": "is",
    "object_id": 1374,
    "weight": 1
  },
  {
    "id": 663,
    "subject_id": 1303,
    "predicate": "is",
    "object_id": 1375,
    "weight": 1
  },
  {
    "id": 664,
    "subject_id": 1304,
    "predicate": "is",
    "object_id": 1376,
    "weight": 1
  },
  {
    "id": 665,
    "subject_id": 664,
    "predicate": "is",
    "object_id": 1377,
    "weight": 1
  },
  {
    "id": 666,
    "subject_id": 1306,
    "predicate": "is",
    "object_id": 1378,
    "weight": 1
  },
  {
    "id": 667,
    "subject_id": 1307,
    "predicate": "is",
    "object_id": 1379,
    "weight": 1
  },
  {
    "id": 668,
    "subject_id": 1308,
    "predicate": "is",
    "object_id": 1380,
    "weight": 1
  },
  {
    "id": 669,
    "subject_id": 1309,
    "predicate": "is",
    "object_id": 1381,
    "weight": 1
  },
  {
    "id": 670,
    "subject_id": 1310,
    "predicate": "is",
    "object_id": 1382,
    "weight": 1
  },
  {
    "id": 671,
    "subject_id": 1311,
    "predicate": "is",
    "object_id": 1383,
    "weight": 1
  },
  {
    "id": 672,
    "subject_id": 1312,
    "predicate": "is",
    "object_id": 1384,
    "weight": 1
  },
  {
    "id": 673,
    "subject_id": 1313,
    "predicate": "is",
    "object_id": 1385,
    "weight": 1
  },
  {
    "id": 674,
    "subject_id": 1314,
    "predicate": "is",
    "object_id": 1386,
    "weight": 1
  },
  {
    "id": 675,
    "subject_id": 1315,
    "predicate": "is",
    "object_id": 1387,
    "weight": 1
  },
  {
    "id": 676,
    "subject_id": 1316,
    "predicate": "is",
    "object_id": 1388,
    "weight": 1
  },
  {
    "id": 677,
    "subject_id": 1317,
    "predicate": "is",
    "object_id": 1389,
    "weight": 1
  },
  {
    "id": 678,
    "subject_id": 1318,
    "predicate": "is",
    "object_id": 1390,
    "weight": 1
  },
  {
    "id": 679,
    "subject_id": 1319,
    "predicate": "is",
    "object_id": 1391,
    "weight": 1
  },
  {
    "id": 680,
    "subject_id": 1320,
    "predicate": "is",
    "object_id": 1392,
    "weight": 1
  },
  {
    "id": 681,
    "subject_id": 1321,
    "predicate": "is",
    "object_id": 1393,
    "weight": 1
  },
  {
    "id": 682,
    "subject_id": 1322,
    "predicate": "is",
    "object_id": 1394,
    "weight": 1
  },
  {
    "id": 683,
    "subject_id": 1323,
    "predicate": "is",
    "object_id": 1395,
    "weight": 1
  },
  {
    "id": 684,
    "subject_id": 1324,
    "predicate": "is",
    "object_id": 1396,
    "weight": 1
  },
  {
    "id": 685,
    "subject_id": 1325,
    "predicate": "is",
    "object_id": 1397,
    "weight": 1
  },
  {
    "id": 686,
    "subject_id": 1326,
    "predicate": "is",
    "object_id": 1398,
    "weight": 1
  },
  {
    "id": 687,
    "subject_id": 1327,
    "predicate": "is",
    "object_id": 1399,
    "weight": 1
  },
  {
    "id": 688,
    "subject_id": 1328,
    "predicate": "is",
    "object_id": 1400,
    "weight": 1
  },
  {
    "id": 689,
    "subject_id": 1329,
    "predicate": "is",
    "object_id": 1401,
    "weight": 1
  },
  {
    "id": 690,
    "subject_id": 1330,
    "predicate": "is",
    "object_id": 1402,
    "weight": 1
  },
  {
    "id": 691,
    "subject_id": 1331,
    "predicate": "is",
    "object_id": 1403,
    "weight": 1
  },
  {
    "id": 692,
    "subject_id": 1332,
    "predicate": "is",
    "object_id": 1404,
    "weight": 1
  },
  {
    "id": 693,
    "subject_id": 1333,
    "predicate": "is",
    "object_id": 1405,
    "weight": 1
  },
  {
    "id": 694,
    "subject_id": 1334,
    "predicate": "is",
    "object_id": 1406,
    "weight": 1
  },
  {
    "id": 695,
    "subject_id": 1335,
    "predicate": "is",
    "object_id": 1407,
    "weight": 1
  },
  {
    "id": 696,
    "subject_id": 1336,
    "predicate": "is",
    "object_id": 1408,
    "weight": 1
  },
  {
    "id": 697,
    "subject_id": 1337,
    "predicate": "is",
    "object_id": 1409,
    "weight": 1
  },
  {
    "id": 698,
    "subject_id": 1338,
    "predicate": "is",
    "object_id": 1410,
    "weight": 1
  },
  {
    "id": 699,
    "subject_id": 1339,
    "predicate": "is",
    "object_id": 1411,
    "weight": 1
  },
  {
    "id": 700,
    "subject_id": 1340,
    "predicate": "is",
    "object_id": 1412,
    "weight": 1
  },
  {
    "id": 701,
    "subject_id": 1341,
    "predicate": "is",
    "object_id": 1413,
    "weight": 1
  },
  {
    "id": 702,
    "subject_id": 1342,
    "predicate": "is",
    "object_id": 1414,
    "weight": 1
  },
  {
    "id": 703,
    "subject_id": 1343,
    "predicate": "is",
    "object_id": 1415,
    "weight": 1
  },
  {
    "id": 704,
    "subject_id": 1344,
    "predicate": "is",
    "object_id": 1416,
    "weight": 1
  },
  {
    "id": 705,
    "subject_id": 1345,
    "predicate": "is",
    "object_id": 1417,
    "weight": 1
  },
  {
    "id": 706,
    "subject_id": 1346,
    "predicate": "is",
    "object_id": 1418,
    "weight": 1
  },
  {
    "id": 707,
    "subject_id": 1347,
    "predicate": "is",
    "object_id": 1419,
    "weight": 1
  },
  {
    "id": 708,
    "subject_id": 1348,
    "predicate": "is",
    "object_id": 1420,
    "weight": 1
  },
  {
    "id": 709,
    "subject_id": 1349,
    "predicate": "is",
    "object_id": 1421,
    "weight": 1
  },
  {
    "id": 710,
    "subject_id": 1350,
    "predicate": "is",
    "object_id": 1422,
    "weight": 1
  },
  {
    "id": 711,
    "subject_id": 1351,
    "predicate": "is",
    "object_id": 1423,
    "weight": 1
  },
  {
    "id": 712,
    "subject_id": 1352,
    "predicate": "is",
    "object_id": 1424,
    "weight": 1
  },
  {
    "id": 713,
    "subject_id": 1425,
    "predicate": "is",
    "object_id": 1502,
    "weight": 1
  },
  {
    "id": 714,
    "subject_id": 1426,
    "predicate": "is",
    "object_id": 1503,
    "weight": 1
  },
  {
    "id": 715,
    "subject_id": 1427,
    "predicate": "is",
    "object_id": 1504,
    "weight": 1
  },
  {
    "id": 716,
    "subject_id": 1428,
    "predicate": "is",
    "object_id": 1505,
    "weight": 1
  },
  {
    "id": 717,
    "subject_id": 1429,
    "predicate": "is",
    "object_id": 1506,
    "weight": 1
  },
  {
    "id": 718,
    "subject_id": 1430,
    "predicate": "is",
    "object_id": 1507,
    "weight": 1
  },
  {
    "id": 719,
    "subject_id": 1431,
    "predicate": "is",
    "object_id": 1508,
    "weight": 1
  },
  {
    "id": 720,
    "subject_id": 1432,
    "predicate": "is",
    "object_id": 1509,
    "weight": 1
  },
  {
    "id": 721,
    "subject_id": 1433,
    "predicate": "is",
    "object_id": 1510,
    "weight": 1
  },
  {
    "id": 722,
    "subject_id": 1434,
    "predicate": "is",
    "object_id": 1511,
    "weight": 1
  },
  {
    "id": 723,
    "subject_id": 1435,
    "predicate": "is",
    "object_id": 1512,
    "weight": 1
  },
  {
    "id": 724,
    "subject_id": 1436,
    "predicate": "is",
    "object_id": 1513,
    "weight": 1
  },
  {
    "id": 725,
    "subject_id": 1437,
    "predicate": "is",
    "object_id": 1514,
    "weight": 1
  },
  {
    "id": 726,
    "subject_id": 1438,
    "predicate": "is",
    "object_id": 1515,
    "weight": 1
  },
  {
    "id": 727,
    "subject_id": 1439,
    "predicate": "is",
    "object_id": 1516,
    "weight": 1
  },
  {
    "id": 728,
    "subject_id": 1440,
    "predicate": "is",
    "object_id": 1517,
    "weight": 1
  },
  {
    "id": 729,
    "subject_id": 1441,
    "predicate": "is",
    "object_id": 1518,
    "weight": 1
  },
  {
    "id": 730,
    "subject_id": 1442,
    "predicate": "is",
    "object_id": 1519,
    "weight": 1
  },
  {
    "id": 731,
    "subject_id": 1443,
    "predicate": "is",
    "object_id": 1520,
    "weight": 1
  },
  {
    "id": 732,
    "subject_id": 1444,
    "predicate": "is",
    "object_id": 1521,
    "weight": 1
  },
  {
    "id": 733,
    "subject_id": 1445,
    "predicate": "is",
    "object_id": 1522,
    "weight": 1
  },
  {
    "id": 734,
    "subject_id": 1446,
    "predicate": "is",
    "object_id": 1523,
    "weight": 1
  },
  {
    "id": 735,
    "subject_id": 1447,
    "predicate": "is",
    "object_id": 1524,
    "weight": 1
  },
  {
    "id": 736,
    "subject_id": 1448,
    "predicate": "is",
    "object_id": 1525,
    "weight": 1
  },
  {
    "id": 737,
    "subject_id": 1449,
    "predicate": "is",
    "object_id": 1526,
    "weight": 1
  },
  {
    "id": 738,
    "subject_id": 1450,
    "predicate": "is",
    "object_id": 1527,
    "weight": 1
  },
  {
    "id": 739,
    "subject_id": 1451,
    "predicate": "is",
    "object_id": 1528,
    "weight": 1
  },
  {
    "id": 740,
    "subject_id": 1452,
    "predicate": "is",
    "object_id": 1529,
    "weight": 1
  },
  {
    "id": 741,
    "subject_id": 1453,
    "predicate": "is",
    "object_id": 1530,
    "weight": 1
  },
  {
    "id": 742,
    "subject_id": 1454,
    "predicate": "is",
    "object_id": 1531,
    "weight": 1
  },
  {
    "id": 743,
    "subject_id": 1455,
    "predicate": "is",
    "object_id": 1532,
    "weight": 1
  },
  {
    "id": 744,
    "subject_id": 1456,
    "predicate": "is",
    "object_id": 1533,
    "weight": 1
  },
  {
    "id": 745,
    "subject_id": 1457,
    "predicate": "is",
    "object_id": 1534,
    "weight": 1
  },
  {
    "id": 746,
    "subject_id": 1458,
    "predicate": "is",
    "object_id": 1535,
    "weight": 1
  },
  {
    "id": 747,
    "subject_id": 1459,
    "predicate": "is",
    "object_id": 1536,
    "weight": 1
  },
  {
    "id": 748,
    "subject_id": 1460,
    "predicate": "is",
    "object_id": 1537,
    "weight": 1
  },
  {
    "id": 749,
    "subject_id": 1461,
    "predicate": "is",
    "object_id": 1538,
    "weight": 1
  },
  {
    "id": 750,
    "subject_id": 1462,
    "predicate": "is",
    "object_id": 1539,
    "weight": 1
  },
  {
    "id": 751,
    "subject_id": 1463,
    "predicate": "is",
    "object_id": 1540,
    "weight": 1
  },
  {
    "id": 752,
    "subject_id": 1464,
    "predicate": "is",
    "object_id": 1541,
    "weight": 1
  },
  {
    "id": 753,
    "subject_id": 1465,
    "predicate": "is",
    "object_id": 1542,
    "weight": 1
  },
  {
    "id": 754,
    "subject_id": 1466,
    "predicate": "is",
    "object_id": 1543,
    "weight": 1
  },
  {
    "id": 755,
    "subject_id": 1467,
    "predicate": "is",
    "object_id": 1544,
    "weight": 1
  },
  {
    "id": 756,
    "subject_id": 1468,
    "predicate": "is",
    "object_id": 1545,
    "weight": 1
  },
  {
    "id": 757,
    "subject_id": 1469,
    "predicate": "is",
    "object_id": 1546,
    "weight": 1
  },
  {
    "id": 758,
    "subject_id": 1470,
    "predicate": "is",
    "object_id": 1547,
    "weight": 1
  },
  {
    "id": 759,
    "subject_id": 1471,
    "predicate": "is",
    "object_id": 1548,
    "weight": 1
  },
  {
    "id": 760,
    "subject_id": 1472,
    "predicate": "is",
    "object_id": 1549,
    "weight": 1
  },
  {
    "id": 761,
    "subject_id": 1473,
    "predicate": "is",
    "object_id": 1550,
    "weight": 1
  },
  {
    "id": 762,
    "subject_id": 1474,
    "predicate": "is",
    "object_id": 1551,
    "weight": 1
  },
  {
    "id": 763,
    "subject_id": 1475,
    "predicate": "is",
    "object_id": 1552,
    "weight": 1
  },
  {
    "id": 764,
    "subject_id": 1476,
    "predicate": "is",
    "object_id": 1553,
    "weight": 1
  },
  {
    "id": 765,
    "subject_id": 1477,
    "predicate": "is",
    "object_id": 1554,
    "weight": 1
  },
  {
    "id": 766,
    "subject_id": 1478,
    "predicate": "is",
    "object_id": 1555,
    "weight": 1
  },
  {
    "id": 767,
    "subject_id": 1479,
    "predicate": "is",
    "object_id": 1556,
    "weight": 1
  },
  {
    "id": 768,
    "subject_id": 1480,
    "predicate": "is",
    "object_id": 1557,
    "weight": 1
  },
  {
    "id": 769,
    "subject_id": 1481,
    "predicate": "is",
    "object_id": 1558,
    "weight": 1
  },
  {
    "id": 770,
    "subject_id": 1482,
    "predicate": "is",
    "object_id": 1559,
    "weight": 1
  },
  {
    "id": 771,
    "subject_id": 1483,
    "predicate": "is",
    "object_id": 1560,
    "weight": 1
  },
  {
    "id": 772,
    "subject_id": 1484,
    "predicate": "is",
    "object_id": 1561,
    "weight": 1
  },
  {
    "id": 773,
    "subject_id": 1485,
    "predicate": "is",
    "object_id": 1562,
    "weight": 1
  },
  {
    "id": 774,
    "subject_id": 1486,
    "predicate": "is",
    "object_id": 1563,
    "weight": 1
  },
  {
    "id": 775,
    "subject_id": 1487,
    "predicate": "is",
    "object_id": 1564,
    "weight": 1
  },
  {
    "id": 776,
    "subject_id": 1488,
    "predicate": "is",
    "object_id": 1565,
    "weight": 1
  },
  {
    "id": 777,
    "subject_id": 1489,
    "predicate": "is",
    "object_id": 1566,
    "weight": 1
  },
  {
    "id": 778,
    "subject_id": 1490,
    "predicate": "is",
    "object_id": 1567,
    "weight": 1
  },
  {
    "id": 779,
    "subject_id": 1491,
    "predicate": "is",
    "object_id": 1568,
    "weight": 1
  },
  {
    "id": 780,
    "subject_id": 1492,
    "predicate": "is",
    "object_id": 1569,
    "weight": 1
  },
  {
    "id": 781,
    "subject_id": 1493,
    "predicate": "is",
    "object_id": 1570,
    "weight": 1
  },
  {
    "id": 782,
    "subject_id": 1494,
    "predicate": "is",
    "object_id": 1571,
    "weight": 1
  },
  {
    "id": 783,
    "subject_id": 1495,
    "predicate": "is",
    "object_id": 1572,
    "weight": 1
  },
  {
    "id": 784,
    "subject_id": 1496,
    "predicate": "is",
    "object_id": 1573,
    "weight": 1
  },
  {
    "id": 785,
    "subject_id": 1497,
    "predicate": "is",
    "object_id": 1574,
    "weight": 1
  },
  {
    "id": 786,
    "subject_id": 1498,
    "predicate": "is",
    "object_id": 1575,
    "weight": 1
  },
  {
    "id": 787,
    "subject_id": 1499,
    "predicate": "is",
    "object_id": 1576,
    "weight": 1
  },
  {
    "id": 788,
    "subject_id": 1500,
    "predicate": "is",
    "object_id": 1577,
    "weight": 1
  },
  {
    "id": 789,
    "subject_id": 1501,
    "predicate": "is",
    "object_id": 1578,
    "weight": 1
  },
  {
    "id": 790,
    "subject_id": 1579,
    "predicate": "is",
    "object_id": 1662,
    "weight": 1
  },
  {
    "id": 791,
    "subject_id": 1580,
    "predicate": "is",
    "object_id": 1663,
    "weight": 1
  },
  {
    "id": 792,
    "subject_id": 1581,
    "predicate": "is",
    "object_id": 1664,
    "weight": 1
  },
  {
    "id": 793,
    "subject_id": 1582,
    "predicate": "is",
    "object_id": 1665,
    "weight": 1
  },
  {
    "id": 794,
    "subject_id": 1583,
    "predicate": "is",
    "object_id": 1666,
    "weight": 1
  },
  {
    "id": 795,
    "subject_id": 1584,
    "predicate": "is",
    "object_id": 1667,
    "weight": 1
  },
  {
    "id": 796,
    "subject_id": 1585,
    "predicate": "is",
    "object_id": 1668,
    "weight": 1
  },
  {
    "id": 797,
    "subject_id": 1586,
    "predicate": "is",
    "object_id": 1669,
    "weight": 1
  },
  {
    "id": 798,
    "subject_id": 1587,
    "predicate": "is",
    "object_id": 1670,
    "weight": 1
  },
  {
    "id": 799,
    "subject_id": 1588,
    "predicate": "is",
    "object_id": 1671,
    "weight": 1
  },
  {
    "id": 800,
    "subject_id": 1589,
    "predicate": "is",
    "object_id": 1672,
    "weight": 1
  },
  {
    "id": 801,
    "subject_id": 1590,
    "predicate": "is",
    "object_id": 1673,
    "weight": 1
  },
  {
    "id": 802,
    "subject_id": 1591,
    "predicate": "is",
    "object_id": 1674,
    "weight": 1
  },
  {
    "id": 803,
    "subject_id": 1592,
    "predicate": "is",
    "object_id": 1675,
    "weight": 1
  },
  {
    "id": 804,
    "subject_id": 1593,
    "predicate": "is",
    "object_id": 1676,
    "weight": 1
  },
  {
    "id": 805,
    "subject_id": 1594,
    "predicate": "is",
    "object_id": 1677,
    "weight": 1
  },
  {
    "id": 806,
    "subject_id": 1595,
    "predicate": "Atlas",
    "object_id": 1678,
    "weight": 1
  },
  {
    "id": 807,
    "subject_id": 1596,
    "predicate": "is",
    "object_id": 1679,
    "weight": 1
  },
  {
    "id": 808,
    "subject_id": 1597,
    "predicate": "is",
    "object_id": 1680,
    "weight": 1
  },
  {
    "id": 809,
    "subject_id": 1598,
    "predicate": "is",
    "object_id": 1681,
    "weight": 1
  },
  {
    "id": 810,
    "subject_id": 1599,
    "predicate": "is",
    "object_id": 1682,
    "weight": 1
  },
  {
    "id": 811,
    "subject_id": 1600,
    "predicate": "is",
    "object_id": 1683,
    "weight": 1
  },
  {
    "id": 812,
    "subject_id": 1601,
    "predicate": "is",
    "object_id": 1684,
    "weight": 1
  },
  {
    "id": 813,
    "subject_id": 1602,
    "predicate": "is",
    "object_id": 1685,
    "weight": 1
  },
  {
    "id": 814,
    "subject_id": 1603,
    "predicate": "is",
    "object_id": 1686,
    "weight": 1
  },
  {
    "id": 815,
    "subject_id": 1604,
    "predicate": "is",
    "object_id": 1687,
    "weight": 1
  },
  {
    "id": 816,
    "subject_id": 1605,
    "predicate": "is",
    "object_id": 1688,
    "weight": 1
  },
  {
    "id": 817,
    "subject_id": 1606,
    "predicate": "is",
    "object_id": 1689,
    "weight": 1
  },
  {
    "id": 818,
    "subject_id": 1607,
    "predicate": "is",
    "object_id": 1690,
    "weight": 1
  },
  {
    "id": 819,
    "subject_id": 1608,
    "predicate": "is",
    "object_id": 1691,
    "weight": 1
  },
  {
    "id": 820,
    "subject_id": 1609,
    "predicate": "is",
    "object_id": 1692,
    "weight": 1
  },
  {
    "id": 821,
    "subject_id": 1610,
    "predicate": "is",
    "object_id": 1693,
    "weight": 1
  },
  {
    "id": 822,
    "subject_id": 1611,
    "predicate": "is",
    "object_id": 1694,
    "weight": 1
  },
  {
    "id": 823,
    "subject_id": 1612,
    "predicate": "is",
    "object_id": 1695,
    "weight": 1
  },
  {
    "id": 824,
    "subject_id": 1613,
    "predicate": "is",
    "object_id": 1696,
    "weight": 1
  },
  {
    "id": 825,
    "subject_id": 1614,
    "predicate": "is",
    "object_id": 1697,
    "weight": 1
  },
  {
    "id": 826,
    "subject_id": 1615,
    "predicate": "is",
    "object_id": 1698,
    "weight": 1
  },
  {
    "id": 827,
    "subject_id": 1616,
    "predicate": "is",
    "object_id": 1699,
    "weight": 1
  },
  {
    "id": 828,
    "subject_id": 1617,
    "predicate": "is",
    "object_id": 1700,
    "weight": 1
  },
  {
    "id": 829,
    "subject_id": 1618,
    "predicate": "is",
    "object_id": 1701,
    "weight": 1
  },
  {
    "id": 830,
    "subject_id": 1619,
    "predicate": "is",
    "object_id": 1702,
    "weight": 1
  },
  {
    "id": 831,
    "subject_id": 1620,
    "predicate": "is",
    "object_id": 1703,
    "weight": 1
  },
  {
    "id": 832,
    "subject_id": 1621,
    "predicate": "is",
    "object_id": 1704,
    "weight": 1
  },
  {
    "id": 833,
    "subject_id": 1622,
    "predicate": "is",
    "object_id": 1705,
    "weight": 1
  },
  {
    "id": 834,
    "subject_id": 1623,
    "predicate": "is",
    "object_id": 1706,
    "weight": 1
  },
  {
    "id": 835,
    "subject_id": 1624,
    "predicate": "is",
    "object_id": 1707,
    "weight": 1
  },
  {
    "id": 836,
    "subject_id": 1625,
    "predicate": "is",
    "object_id": 1708,
    "weight": 1
  },
  {
    "id": 837,
    "subject_id": 1626,
    "predicate": "is",
    "object_id": 1709,
    "weight": 1
  },
  {
    "id": 838,
    "subject_id": 1627,
    "predicate": "is",
    "object_id": 1710,
    "weight": 1
  },
  {
    "id": 839,
    "subject_id": 1628,
    "predicate": "is",
    "object_id": 1711,
    "weight": 1
  },
  {
    "id": 840,
    "subject_id": 1629,
    "predicate": "is",
    "object_id": 1712,
    "weight": 1
  },
  {
    "id": 841,
    "subject_id": 1630,
    "predicate": "is",
    "object_id": 1713,
    "weight": 1
  },
  {
    "id": 842,
    "subject_id": 1631,
    "predicate": "is",
    "object_id": 1714,
    "weight": 1
  },
  {
    "id": 843,
    "subject_id": 1632,
    "predicate": "is",
    "object_id": 1715,
    "weight": 1
  },
  {
    "id": 844,
    "subject_id": 1633,
    "predicate": "is",
    "object_id": 1716,
    "weight": 1
  },
  {
    "id": 845,
    "subject_id": 1634,
    "predicate": "is",
    "object_id": 1717,
    "weight": 1
  },
  {
    "id": 846,
    "subject_id": 1635,
    "predicate": "is",
    "object_id": 1718,
    "weight": 1
  },
  {
    "id": 847,
    "subject_id": 1636,
    "predicate": "is",
    "object_id": 1719,
    "weight": 1
  },
  {
    "id": 848,
    "subject_id": 1637,
    "predicate": "is",
    "object_id": 1720,
    "weight": 1
  },
  {
    "id": 849,
    "subject_id": 1638,
    "predicate": "is",
    "object_id": 1721,
    "weight": 1
  },
  {
    "id": 850,
    "subject_id": 1639,
    "predicate": "is",
    "object_id": 1722,
    "weight": 1
  },
  {
    "id": 851,
    "subject_id": 1640,
    "predicate": "is",
    "object_id": 1723,
    "weight": 1
  },
  {
    "id": 852,
    "subject_id": 1641,
    "predicate": "is",
    "object_id": 1724,
    "weight": 1
  },
  {
    "id": 853,
    "subject_id": 1642,
    "predicate": "is",
    "object_id": 1725,
    "weight": 1
  },
  {
    "id": 854,
    "subject_id": 1643,
    "predicate": "is",
    "object_id": 1726,
    "weight": 1
  },
  {
    "id": 855,
    "subject_id": 1644,
    "predicate": "is",
    "object_id": 1727,
    "weight": 1
  },
  {
    "id": 856,
    "subject_id": 1645,
    "predicate": "is",
    "object_id": 1728,
    "weight": 1
  },
  {
    "id": 857,
    "subject_id": 1646,
    "predicate": "is",
    "object_id": 1729,
    "weight": 1
  },
  {
    "id": 858,
    "subject_id": 1647,
    "predicate": "is",
    "object_id": 1730,
    "weight": 1
  },
  {
    "id": 859,
    "subject_id": 1648,
    "predicate": "is",
    "object_id": 1731,
    "weight": 1
  },
  {
    "id": 860,
    "subject_id": 1649,
    "predicate": "is",
    "object_id": 1732,
    "weight": 1
  },
  {
    "id": 861,
    "subject_id": 1650,
    "predicate": "is",
    "object_id": 1733,
    "weight": 1
  },
  {
    "id": 862,
    "subject_id": 1651,
    "predicate": "is",
    "object_id": 1734,
    "weight": 1
  },
  {
    "id": 863,
    "subject_id": 1652,
    "predicate": "is",
    "object_id": 1735,
    "weight": 1
  },
  {
    "id": 864,
    "subject_id": 1653,
    "predicate": "is",
    "object_id": 1736,
    "weight": 1
  },
  {
    "id": 865,
    "subject_id": 1654,
    "predicate": "is",
    "object_id": 1737,
    "weight": 1
  },
  {
    "id": 866,
    "subject_id": 1655,
    "predicate": "is",
    "object_id": 1738,
    "weight": 1
  },
  {
    "id": 867,
    "subject_id": 1656,
    "predicate": "is",
    "object_id": 1739,
    "weight": 1
  },
  {
    "id": 868,
    "subject_id": 1657,
    "predicate": "is",
    "object_id": 1740,
    "weight": 1
  },
  {
    "id": 869,
    "subject_id": 1658,
    "predicate": "is",
    "object_id": 1741,
    "weight": 1
  },
  {
    "id": 870,
    "subject_id": 1659,
    "predicate": "is",
    "object_id": 1742,
    "weight": 1
  },
  {
    "id": 871,
    "subject_id": 1660,
    "predicate": "is",
    "object_id": 1743,
    "weight": 1
  },
  {
    "id": 872,
    "subject_id": 1661,
    "predicate": "is",
    "object_id": 1744,
    "weight": 1
  },
  {
    "id": 873,
    "subject_id": 1745,
    "predicate": "is",
    "object_id": 1782,
    "weight": 1
  },
  {
    "id": 874,
    "subject_id": 1746,
    "predicate": "is",
    "object_id": 1783,
    "weight": 1
  },
  {
    "id": 875,
    "subject_id": 1747,
    "predicate": "is",
    "object_id": 1784,
    "weight": 1
  },
  {
    "id": 876,
    "subject_id": 1748,
    "predicate": "is",
    "object_id": 1785,
    "weight": 1
  },
  {
    "id": 877,
    "subject_id": 1749,
    "predicate": "is",
    "object_id": 1786,
    "weight": 1
  },
  {
    "id": 878,
    "subject_id": 1648,
    "predicate": "is",
    "object_id": 1787,
    "weight": 1
  },
  {
    "id": 879,
    "subject_id": 1751,
    "predicate": "is",
    "object_id": 1788,
    "weight": 1
  },
  {
    "id": 880,
    "subject_id": 1752,
    "predicate": "is",
    "object_id": 1789,
    "weight": 1
  },
  {
    "id": 881,
    "subject_id": 1753,
    "predicate": "is",
    "object_id": 1790,
    "weight": 1
  },
  {
    "id": 882,
    "subject_id": 1754,
    "predicate": "is",
    "object_id": 1791,
    "weight": 1
  },
  {
    "id": 883,
    "subject_id": 1755,
    "predicate": "is",
    "object_id": 1792,
    "weight": 1
  },
  {
    "id": 884,
    "subject_id": 1756,
    "predicate": "is",
    "object_id": 1793,
    "weight": 1
  },
  {
    "id": 885,
    "subject_id": 1757,
    "predicate": "is",
    "object_id": 1794,
    "weight": 1
  },
  {
    "id": 886,
    "subject_id": 1758,
    "predicate": "is",
    "object_id": 1795,
    "weight": 1
  },
  {
    "id": 887,
    "subject_id": 1759,
    "predicate": "is",
    "object_id": 1796,
    "weight": 1
  },
  {
    "id": 888,
    "subject_id": 1760,
    "predicate": "is",
    "object_id": 1797,
    "weight": 1
  },
  {
    "id": 889,
    "subject_id": 1761,
    "predicate": "is",
    "object_id": 1798,
    "weight": 1
  },
  {
    "id": 890,
    "subject_id": 1762,
    "predicate": "is",
    "object_id": 1799,
    "weight": 1
  },
  {
    "id": 891,
    "subject_id": 1763,
    "predicate": "is",
    "object_id": 1800,
    "weight": 1
  },
  {
    "id": 892,
    "subject_id": 1764,
    "predicate": "is",
    "object_id": 1801,
    "weight": 1
  },
  {
    "id": 893,
    "subject_id": 1765,
    "predicate": "is",
    "object_id": 1802,
    "weight": 1
  },
  {
    "id": 894,
    "subject_id": 1766,
    "predicate": "is",
    "object_id": 1803,
    "weight": 1
  },
  {
    "id": 895,
    "subject_id": 1767,
    "predicate": "is",
    "object_id": 1804,
    "weight": 1
  },
  {
    "id": 896,
    "subject_id": 1768,
    "predicate": "is",
    "object_id": 1805,
    "weight": 1
  },
  {
    "id": 897,
    "subject_id": 1769,
    "predicate": "is",
    "object_id": 1806,
    "weight": 1
  },
  {
    "id": 898,
    "subject_id": 1770,
    "predicate": "is",
    "object_id": 1807,
    "weight": 1
  },
  {
    "id": 899,
    "subject_id": 1771,
    "predicate": "is",
    "object_id": 1808,
    "weight": 1
  },
  {
    "id": 900,
    "subject_id": 1772,
    "predicate": "is",
    "object_id": 1809,
    "weight": 1
  },
  {
    "id": 901,
    "subject_id": 1773,
    "predicate": "is",
    "object_id": 1810,
    "weight": 1
  },
  {
    "id": 902,
    "subject_id": 1774,
    "predicate": "is",
    "object_id": 1811,
    "weight": 1
  },
  {
    "id": 903,
    "subject_id": 1775,
    "predicate": "is",
    "object_id": 1812,
    "weight": 1
  },
  {
    "id": 904,
    "subject_id": 1776,
    "predicate": "is",
    "object_id": 1813,
    "weight": 1
  },
  {
    "id": 905,
    "subject_id": 1777,
    "predicate": "is",
    "object_id": 1814,
    "weight": 1
  },
  {
    "id": 906,
    "subject_id": 1778,
    "predicate": "is",
    "object_id": 1815,
    "weight": 1
  },
  {
    "id": 907,
    "subject_id": 1779,
    "predicate": "is",
    "object_id": 1816,
    "weight": 1
  },
  {
    "id": 908,
    "subject_id": 1780,
    "predicate": "is",
    "object_id": 1817,
    "weight": 1
  },
  {
    "id": 909,
    "subject_id": 1781,
    "predicate": "is",
    "object_id": 1818,
    "weight": 1
  }
];

// ⚡ FULL 2 KNOWLEDGE FACTS EMBEDDED ⚡
const embeddedKnowledge = [
  [
    "# Type: myName",
    "is",
    "[your name]"
  ],
  [
    "myName",
    "is",
    "John"
  ]
];

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
// Cache bust - Tue Jul 28 21:18:35 EDT 2026
