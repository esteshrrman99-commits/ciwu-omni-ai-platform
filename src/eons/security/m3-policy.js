const path = require("path");

class M3Policy {
  constructor(root = "./workspace") {
    this.root = path.resolve(root);

    this.allowedExecutables = new Set([
      "node",
      "npm",
      "npx",
      "git"
    ]);

    this.blockedPatterns = [
      "rm -rf /",
      "mkfs",
      "dd if=",
      "shutdown",
      "reboot",
      ":(){",
      "fork bomb",
      "curl | sh",
      "wget | sh",
      "chmod 777",
      "/etc/",
      "/system/",
      "/data/",
      "~/.ssh/",
      ".env"
    ];
  }

  safePath(target) {
    const resolved = path.resolve(this.root, target);

    return (
      resolved === this.root ||
      resolved.startsWith(this.root + path.sep)
    );
  }

  validateExecutable(executable) {
    if (!this.allowedExecutables.has(executable)) {
      throw new Error(
        `M3 POLICY BLOCK: executable '${executable}' is not approved`
      );
    }

    return true;
  }

  validateCommand(command) {
    const lower = String(command).toLowerCase();

    for (const pattern of this.blockedPatterns) {
      if (lower.includes(pattern.toLowerCase())) {
        throw new Error(
          "M3 POLICY BLOCK: potentially unsafe operation"
        );
      }
    }

    return true;
  }

  validateWorkspacePath(target) {
    if (!this.safePath(target)) {
      throw new Error(
        `M3 POLICY BLOCK: path escapes workspace: ${target}`
      );
    }

    return true;
  }
}

module.exports = M3Policy;
