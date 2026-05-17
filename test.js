import portguard from "./index.js";

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    passed++;
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${name}`);
    failed++;
  }
}

console.log("\n\x1b[1mportguard-cli tests\x1b[0m\n");

// Test 1: Returns same port if available
const r1 = await portguard(0, { next: false });
assert(typeof r1 === "number" && r1 === 0, "Returns port 0 as available");

// Test 2: Finds next available port
const r2 = await portguard(0, { next: true });
assert(typeof r2 === "number" && r2 >= 0, "Finds next available port");

// Test 3: High port is available
const r3 = await portguard(54321, { next: false });
assert(r3 === 54321, "Reports high port as available");

// Test 4: Returns null when no next port option
const r4 = await portguard(0, { next: false });
assert(r4 === 0, "Returns same port when next is false");

// Test 5: Returns port as number
assert(typeof r1 === "number", "Returns port as number");

// Test 6: Handles very high port
const r6 = await portguard(65535, { next: false });
assert(r6 === 65535 || r6 === null, "Handles high port range");

console.log(
  `\n\x1b[1m${passed} passed\x1b[0m${failed > 0 ? `, \x1b[31m${failed} failed\x1b[0m` : ""}\n`
);
process.exit(failed > 0 ? 1 : 0);
