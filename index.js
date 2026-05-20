import { execSync } from "node:child_process";
import net from "node:net";

function isWindows() {
  return process.platform === "win32";
}

function getLsofCommand(port) {
  if (isWindows()) {
    return `netstat -ano | findstr :${port}`;
  }
  return `lsof -i :${port} -P -n -sTCP:LISTEN 2>/dev/null`;
}

function getKillCommand(pid) {
  if (isWindows()) {
    return `taskkill /PID ${pid} /F 2>nul`;
  }
  return `kill -9 ${pid} 2>/dev/null`;
}

function checkPortWithNet(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") resolve(true);
      else resolve(false);
    });
    server.once("listening", () => {
      server.close();
      resolve(false);
    });
    server.listen(port, "127.0.0.1");
  });
}

async function findAvailablePort(start) {
  let port = start;
  while (port < 65535) {
    const busy = await checkPortWithNet(port);
    if (!busy) return port;
    port++;
  }
  return null;
}

async function findAvailablePortInRange(start, end) {
  for (let port = start; port <= Math.min(end, 65535); port++) {
    const busy = await checkPortWithNet(port);
    if (!busy) return port;
  }
  return null;
}

function getProcessInfo(port) {
  try {
    const cmd = getLsofCommand(port);
    const output = execSync(cmd, { encoding: "utf-8", timeout: 3000 });
    if (!output.trim()) return null;

    if (isWindows()) {
      const lines = output.trim().split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) return { pid: parseInt(pid), name: "process" };
      }
      return null;
    }

    const lines = output.trim().split("\n");
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2 && /^\d+$/.test(parts[1])) {
        return { pid: parseInt(parts[1]), name: parts[0] };
      }
    }
    return null;
  } catch {
    return null;
  }
}

function killProcess(pid) {
  try {
    execSync(getKillCommand(pid), { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

export default async function portguard(port, options = {}) {
  const { next = true, kill = false, range = null } = options;

  const busy = await checkPortWithNet(port);

  if (!busy) return port;

  const proc = getProcessInfo(port);

  if (kill && proc) {
    killProcess(proc.pid);
    await new Promise((r) => setTimeout(r, 200));
    const stillBusy = await checkPortWithNet(port);
    if (!stillBusy) return port;
  }

  if (range) {
    const [rangeStart, rangeEnd] = range;
    const available = await findAvailablePortInRange(Math.max(rangeStart, port), rangeEnd);
    if (available !== null) return available;
  }

  if (next) {
    const available = await findAvailablePort(port + 1);
    if (available !== null) return available;
  }

  return null;
}

export { checkPortWithNet, findAvailablePort, findAvailablePortInRange, getProcessInfo, killProcess };
