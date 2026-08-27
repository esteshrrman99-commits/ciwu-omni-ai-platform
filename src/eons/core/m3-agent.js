const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

class M3CodingAgent {
  constructor(options = {}) {
    this.root = path.resolve(options.workspace || "./workspace");

    this.allowed = new Set([
      "node",
      "npm",
      "npx",
      "git"
    ]);

    this.blocked = [
      "rm -rf /",
      "mkfs",
      "dd if=",
      "shutdown",
      "reboot",
      ":(){",
      "fork bomb",
      "curl | sh",
      "wget | sh"
    ];
  }

  safePath(target) {
    const resolved = path.resolve(this.root, target);
    return resolved === this.root ||
      resolved.startsWith(this.root + path.sep);
  }

  validateCommand(command) {
    const parts = command.trim().split(/\s+/);
    const executable = parts[0];

    if (!this.allowed.has(executable)) {
      throw new Error(`M3 BLOCKED executable: ${executable}`);
    }

    const lower = command.toLowerCase();

    for (const pattern of this.blocked) {
      if (lower.includes(pattern)) {
        throw new Error(`M3 BLOCKED dangerous command`);
      }
    }

    return true;
  }

  run(command, args = [], options = {}) {
    this.validateCommand([command, ...args].join(" "));

    return new Promise((resolve, reject) => {
      execFile(
        command,
        args,
        {
          cwd: this.root,
          timeout: options.timeout || 120000,
          maxBuffer: options.maxBuffer || 2 * 1024 * 1024
        },
        (error, stdout, stderr) => {
          resolve({
            ok: !error,
            code: error ? error.code : 0,
            stdout,
            stderr
          });
        }
      );
    });
  }

  async inspect() {
    return this.run("git", ["status", "--short"]);
  }

  async test() {
    return this.run("npm", ["test", "--", "--runInBand"]);
  }

  async execute(command, args = []) {
    return this.run(command, args);
  }
}

module.exports = M3CodingAgent;
