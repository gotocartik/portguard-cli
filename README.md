# portguard-cli

![npm](https://img.shields.io/npm/dt/portguard-cli)
![npm](https://img.shields.io/npm/dw/portguard-cli)
![npm version](https://img.shields.io/npm/v/portguard-cli)
![license](https://img.shields.io/npm/l/portguard-cli)

> A lightweight Node.js utility and CLI tool that detects busy ports, finds available ports, and optionally kills blocking processes. Works on macOS, Linux, and Windows.

## Installation

```bash
npm install -g portguard-cli
```

Or run instantly:

```bash
npx portguard-cli 3000
```

## CLI Usage

### Check and auto-switch

```
$ npx portguard-cli 3000

  🔍 Checking port 3000...

  ⚠ Port 3000 is busy

  Found:
  PID 8421 (node)

  ✅ Switched to port 3001
```

### Kill blocking process

```
$ npx portguard-cli 3000 --kill

  🔍 Checking port 3000...

  ⚠ Port 3000 is busy

  Found:
  PID 8421 (node)

  Killing process 8421...
  ✅ Port 3000 is now available
```

## API Usage

```js
import portguard from "portguard-cli";

// Check if port 3000 is available, auto-switch to next
const port = await portguard(3000, { next: true });
// Returns 3000 if free, 3001 if busy, etc.

// Just check, no auto-switch
const available = await portguard(3000, { next: false });

// Kill the blocking process
const killPort = await portguard(3000, { kill: true });
```

## Options

| Option | Type    | Default | Description                               |
| ------ | ------- | ------- | ----------------------------------------- |
| next   | boolean | `true`  | Auto-find next available port if busy     |
| kill   | boolean | `false` | Kill the process blocking the port        |

## API Reference

### `portguard(port, options?)`

Returns the available port number, or `null` if none found.

### `checkPortWithNet(port): Promise<boolean>`

Check if a port is busy using Node.js `net` module.

### `findAvailablePort(start: number): Promise<number | null>`

Scan sequentially from `start` for a free port.

### `getProcessInfo(port): { pid, name } | null`

Get info about the process using a port.

### `killProcess(pid): boolean`

Kill a process by PID.

## Platform Support

| Feature     | macOS | Linux | Windows |
| ----------- | ----- | ----- | ------- |
| Port check  | ✅    | ✅    | ✅      |
| Process info| ✅    | ✅    | ✅      |
| Kill process| ✅    | ✅    | ✅      |

## Test

```bash
node test.js
```

## License

MIT
