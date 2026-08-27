const fs = require("fs");
const path = require("path");

console.log("");
console.log("================================================");
console.log("       EONS OMNIMODEL DIAGNOSTICS");
console.log("================================================");
console.log("");

const required = [
  "src/config/eons-model-registry.js",
  "src/services/eons-model-router.js",
  "src/routes/eons-models.js"
];

let failed = false;

for (const file of required) {

  const full = path.join(process.cwd(), file);

  if (fs.existsSync(full)) {
    console.log("OK   " + file);
  } else {
    console.log("FAIL " + file);
    failed = true;
  }
}

console.log("");

try {

  const Registry =
    require("../src/config/eons-model-registry");

  console.log(
    "Providers:",
    Object.keys(Registry.providers).join(", ")
  );

  console.log(
    "Future architecture slots:",
    Object.keys(Registry.futureSlots).length
  );

} catch (error) {

  console.error("Registry load failure:", error.message);
  failed = true;
}

console.log("");

if (failed) {
  console.log("EONS diagnostics: FAILED");
  process.exit(1);
}

console.log("EONS diagnostics: PASSED");
