// Summarises `pnpm audit --json` (piped on stdin) for the parts of the
// workspace we actually ship: apps/* and packages/*.
//
// infrastructure/* and docs are deliberately excluded. They carry their own
// advisories, and gating on them would leave this check permanently red, which
// trains everyone to ignore it.
//
// Exit code is 1 only when a critical advisory reaches shipped code. Highs and
// below are reported but do not fail, because the remaining ones are documented
// accepted risks: packages with no fixed version, code paths that never execute,
// and build-time-only tooling.

const IN_SCOPE = /^(apps__|packages__)/;

const raw = await new Promise((resolve, reject) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (buf += d));
  process.stdin.on("end", () => resolve(buf));
  process.stdin.on("error", reject);
});

let report;
try {
  report = JSON.parse(raw);
} catch {
  console.error("Could not parse audit JSON. `pnpm audit --json` produced:\n" + raw.slice(0, 500));
  process.exit(2);
}

const advisories = new Map();
for (const advisory of Object.values(report.advisories ?? {})) {
  const projects = new Set();
  for (const finding of advisory.findings ?? []) {
    for (const path of finding.paths ?? []) projects.add(path.split(">")[0]);
  }
  const scoped = [...projects].filter((p) => IN_SCOPE.test(p));
  if (scoped.length === 0) continue;
  advisories.set(advisory.id, {
    severity: advisory.severity,
    module: advisory.module_name,
    patched: advisory.patched_versions,
    projects: scoped.map((p) => p.replace(/^(apps|packages)__/, "")),
  });
}

const counts = { critical: 0, high: 0, moderate: 0, low: 0 };
for (const a of advisories.values()) counts[a.severity] = (counts[a.severity] ?? 0) + 1;

console.log(`In-scope advisories (apps/* and packages/*): ${advisories.size}`);
console.log(`  critical ${counts.critical} | high ${counts.high} | moderate ${counts.moderate} | low ${counts.low}\n`);

const notable = [...advisories.values()]
  .filter((a) => a.severity === "critical" || a.severity === "high")
  .sort((a, b) => (a.severity === b.severity ? a.module.localeCompare(b.module) : a.severity === "critical" ? -1 : 1));

if (notable.length > 0) {
  console.log("critical and high:");
  for (const a of notable) {
    // "<0.0.0" is how the registry reports "no fixed version exists".
    const fix = a.patched === "<0.0.0" ? "no fix available" : `fixed in ${a.patched}`;
    console.log(`  ${a.severity.toUpperCase().padEnd(8)} ${a.module.padEnd(26)} ${fix.padEnd(24)} ${a.projects.join(", ")}`);
  }
  console.log("");
}

if (counts.critical > 0) {
  console.error(`FAIL: ${counts.critical} critical advisory/advisories in shipped code.`);
  process.exit(1);
}
console.log("OK: no critical advisories in shipped code.");
