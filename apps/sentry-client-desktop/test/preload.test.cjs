/**
 * Contract test for the preload bridge.
 *
 * The preload is the only channel between the renderer and the main process, and
 * nothing else in the build verifies it. A broken bridge still compiles, still
 * packages, and only fails once the window is open, which is how an Electron
 * upgrade previously shipped a client that rendered nothing but its background.
 *
 * Run with: node test/preload.test.cjs   (after building dist-electron/preload.js)
 */
const Module = require("module");
const path = require("path");
const fs = require("fs");
const { EventEmitter } = require("events");

const PRELOAD = path.join(__dirname, "..", "dist-electron", "preload.js");
if (!fs.existsSync(PRELOAD)) {
  console.error(`No build found at ${PRELOAD}. Run the desktop build first.`);
  process.exit(2);
}

// Electron's ipcRenderer keeps its methods on a class prototype, where they are
// not enumerable. Reproducing that here is the whole point: contextBridge only
// transfers own enumerable properties, so anything that relies on the prototype
// chain silently arrives in the renderer with no methods on it.
class IpcRendererStub extends EventEmitter {
  invoke(channel, ...args) { return Promise.resolve({ channel, args }); }
  send() {}
}
const ipcRenderer = new IpcRendererStub();

const exposed = {};
const electronStub = {
  ipcRenderer,
  contextBridge: {
    exposeInMainWorld: (key, value) => {
      // Mirror contextBridge: own enumerable properties only.
      const copy = {};
      for (const k of Object.keys(value)) copy[k] = value[k];
      exposed[key] = copy;
    },
  },
};

const originalLoad = Module._load;
Module._load = function (request) {
  if (request === "electron") return electronStub;
  return originalLoad.apply(this, arguments);
};

// Minimal DOM for the preload's loading-spinner helpers.
const noop = () => {};
global.window = { addEventListener: noop, removeEventListener: noop };
global.document = {
  readyState: "complete",
  addEventListener: noop,
  removeEventListener: noop,
  createElement: () => ({ style: {}, appendChild: noop, className: "", innerHTML: "" }),
  head: { appendChild: noop, removeChild: noop },
  body: { appendChild: noop, removeChild: noop },
};
global.self = global;

require(PRELOAD);

const failures = [];
const check = (condition, description) => {
  console.log(`  ${condition ? "PASS" : "FAIL"}  ${description}`);
  if (!condition) failures.push(description);
};

const api = exposed.ipcRenderer;
check(!!api, "ipcRenderer is exposed on window");
for (const method of ["invoke", "on", "removeListener"]) {
  check(typeof api?.[method] === "function", `window.ipcRenderer.${method} is a function`);
}
check(typeof exposed.electron?.openExternal === "function", "window.electron.openExternal is a function");
check(typeof exposed.electron?.platform === "string", "window.electron.platform is a string");

if (typeof api?.on === "function") {
  // main.tsx listens for this on startup.
  let received = null;
  api.on("main-process-message", (message) => { received = message; });
  ipcRenderer.emit("main-process-message", { sender: {} }, "hello");
  check(received === "hello", "on() delivers the payload without the IpcRendererEvent");

  // useChainDataWithCallback switches network on this channel.
  let network = null;
  const onConfig = (message) => { network = message; };
  api.on("config-updated", onConfig);
  ipcRenderer.emit("config-updated", { sender: {} }, "arbitrumSepolia");
  check(network === "arbitrumSepolia", "config-updated payload arrives (network switching)");

  // The listener is wrapped internally, so removal has to map back to the wrapper.
  api.removeListener("config-updated", onConfig);
  network = null;
  ipcRenderer.emit("config-updated", { sender: {} }, "arbitrumOne");
  check(network === null, "removeListener() detaches a wrapped listener");
  check(ipcRenderer.listenerCount("config-updated") === 0, "no listener remains after removal");
  check(ipcRenderer.listenerCount("main-process-message") === 1, "unrelated listeners survive removal");
}

const finish = () => {
  console.log(failures.length ? `\n  ${failures.length} failure(s)` : "\n  preload contract OK");
  process.exit(failures.length ? 1 : 0);
};

if (typeof api?.invoke === "function") {
  api.invoke("fs-existsSync", "/tmp/example").then((result) => {
    check(
      result && result.channel === "fs-existsSync" && result.args[0] === "/tmp/example",
      "invoke() forwards the channel and arguments",
    );
    finish();
  });
} else {
  finish();
}
