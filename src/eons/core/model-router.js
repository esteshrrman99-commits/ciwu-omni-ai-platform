class EonsModelRouter {
  constructor() {
    this.providers = {};
  }

  register(name, provider) {
    this.providers[name] = provider;
  }

  async generate(task, options = {}) {
    const preferred = options.provider;

    if (preferred && this.providers[preferred]) {
      return this.providers[preferred].generate(task, options);
    }

    const names = Object.keys(this.providers);

    if (!names.length) {
      throw new Error("No AI model provider configured.");
    }

    return this.providers[names[0]].generate(task, options);
  }
}

module.exports = EonsModelRouter;
