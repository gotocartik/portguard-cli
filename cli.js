#!/usr/bin/env node

import portguard, { getProcessInfo, killProcess } from "./index.js";

const red = "\x1b[31m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const cyan = "\x1b[36m";
const dim = "\x1b[2m";
const bold = "\x1b[1m";
const reset = "\x1b[0m";

const args = process.argv.slice(2);
const portIndex = args.findIndex((a) => !a.startsWith("--"));
const port = portIndex !== -1 ? parseInt(args[portIndex]) : null;
const kill = args.includes("--kill");
const rangeArg = args.find((a) => a.startsWith("--range="));
let range = null;
if (rangeArg) {
  const parts = rangeArg.split("=")[1].split("-");
  const rStart = parseInt(parts[0]);
  const rEnd = parseInt(parts[1]);
  if (!isNaN(rStart) && !isNaN(rEnd) && rStart > 0 && rEnd <= 65535 && rStart < rEnd) {
    range = [rStart, rEnd];
  }
}

if (!port || isNaN(port) || port < 1 || port > 65535) {
  console.log(`\n  ${bold}portguard-cli${reset} — check and manage ports\n`);
  console.log(`  ${dim}Usage:${reset}`);
  console.log(`    npx portguard-cli ${cyan}<port>${reset}`);
  console.log(`    npx portguard-cli ${cyan}<port>${reset} ${yellow}--kill${reset}`);
  console.log(`    npx portguard-cli ${cyan}<port>${reset} ${yellow}--range=3000-3010${reset}\n`);
  process.exit(1);
}

console.log(`\n  ${bold}🔍 Checking port ${port}...${reset}\n`);

const result = await portguard(port, { next: true, kill: false, range });

if (result === port) {
  console.log(`  ${green}✅ Port ${port} is available${reset}\n`);
  process.exit(0);
}

const proc = getProcessInfo(port);

if (kill) {
  console.log(`  ${yellow}⚠ Port ${port} is busy${reset}\n`);
  if (proc) {
    console.log(`  ${dim}Found:${reset}`);
    console.log(`  PID ${proc.pid} (${proc.name})\n`);
    console.log(`  ${dim}Killing process ${proc.pid}...${reset}`);
    const killed = killProcess(proc.pid);
    if (killed) {
      await new Promise((r) => setTimeout(r, 300));
      const cleared = await portguard(port, { next: false, kill: false });
      if (cleared === port) {
        console.log(`  ${green}✅ Port ${port} is now available${reset}\n`);
        process.exit(0);
      }
    }
    console.log(`  ${red}❌ Failed to free port ${port}${reset}\n`);
    process.exit(1);
  }
} else {
  console.log(`  ${yellow}⚠ Port ${port} is busy${reset}\n`);
  if (proc) {
    console.log(`  ${dim}Found:${reset}`);
    console.log(`  PID ${proc.pid} (${proc.name})\n`);
  }
  console.log(`  ${green}✅ Switched to port ${result}${reset}\n`);
  process.exit(0);
}
