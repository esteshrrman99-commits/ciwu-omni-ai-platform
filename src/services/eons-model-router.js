const registry = require("../config/eons-model-registry");

class EonsModelRouter {

  constructor() {
    this.registry = registry;
    this.health = new Map();
  }

  getAvailableModels() {

    const available = [];

    for (const [providerName, provider] of Object.entries(
      this.registry.providers
    )) {

      if (!provider.enabled) continue;

      const key = provider.environmentKey;

      if (key && !process.env[key]) {
        continue;
      }

      for (const model of provider.models || []) {

        if (!model.enabled) continue;

        available.push({
          provider: providerName,
          id: model.id,
          role: model.role || []
        });
      }
    }

    return available;
  }

  selectModel(task = {}) {

    const models = this.getAvailableModels();

    if (!models.length) {
      throw new Error(
        "EONS: No configured AI model is currently available."
      );
    }

    const requestedRole = task.role || "chat";

    const matching = models.filter(model =>
      model.role.includes(requestedRole)
    );

    return matching[0] || models[0];
  }

  status() {

    return {
      architecture: this.registry.architecture,
      availableModels: this.getAvailableModels(),
      futureSlots: this.registry.futureSlots
    };
  }
}

module.exports = EonsModelRouter;
