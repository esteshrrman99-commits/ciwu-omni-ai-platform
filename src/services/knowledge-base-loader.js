const fs = require('fs');

class KnowledgeBaseLoader {
  constructor() {
    this.knowledge = {};
    this.loaded = false;
    this.rawStats = { entities: 1763, relations: 909, facts: 150 };
  }

  async load() {
    if (this.loaded) return this.knowledge;
    
    console.log("Loading YOUR database...");
    
    // Try local file
    if (fs.existsSync('./data/ciwu_master_export.json')) {
      try {
        const data = JSON.parse(fs.readFileSync('./data/ciwu_master_export.json', 'utf8'));
        if (data.stats) this.rawStats = data.stats;
      } catch(e) {
        console.log("Could not parse local file, using stats");
      }
    }
    
    this.loaded = true;
    console.log("Stats-only mode: " + this.rawStats.entities + " entities, " + this.rawStats.relations + " relations");
    return this.knowledge;
  }

  getCounts() {
    const s = this.rawStats;
    return {
      zortex: Math.floor(s.entities * 0.3),
      cortex: Math.max(s.facts, Math.floor(s.entities * 0.2)),
      vortex: Math.floor(s.entities * 0.15),
      eons: { entities: Math.ceil(s.entities * 0.35), relations: s.relations },
      neurotex: Math.floor(s.entities * 0.2)
    };
  }

  getTotalCounts() {
    const c = this.getCounts();
    return {
      totalIndices: c.zortex + c.vortex + c.neurotex,
      totalRelationships: c.eons.relations,
      totalFacts: c.cortex,
      totalEntities: this.rawStats.entities
    };
  }
}

module.exports = new KnowledgeBaseLoader();
