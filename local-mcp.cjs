const { spawn } = require("node:child_process");

const packageName = process.argv[2];
if (!/^(momentic|momentic-mobile)@\d+\.\d+\.\d+$/.test(packageName ?? "")) {
  throw new Error("Expected a pinned Momentic CLI package.");
}
const env = { ...process.env };
const configuredKey = env.MOMENTIC_PLUGIN_API_KEY?.trim();
delete env.MOMENTIC_PLUGIN_API_KEY;
if (configuredKey && !/^\$\{[^}]*\}$/.test(configuredKey)) {
  env.MOMENTIC_API_KEY = configuredKey;
}
const child = spawn("npx", ["-y", packageName, "mcp"], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});
const interrupt = () => child.kill("SIGINT");
const terminate = () => child.kill("SIGTERM");
process.once("SIGINT", interrupt);
process.once("SIGTERM", terminate);
child.once("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.once("exit", (code, signal) => {
  process.removeListener("SIGINT", interrupt);
  process.removeListener("SIGTERM", terminate);
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
