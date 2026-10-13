const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'beautify-integration-'));
const result = spawnSync(process.env.VSCODE_CLI || 'code', [
  dir, '--wait', '--new-window', '--user-data-dir', path.join(dir, 'user-data'),
  '--extensions-dir', path.join(dir, 'extensions'),
  `--extensionDevelopmentPath=${root}`,
  `--extensionTestsPath=${path.join(__dirname, 'integration.cjs')}`,
  '--disable-extensions', '--skip-welcome', '--skip-release-notes', '--disable-workspace-trust'
], { env: { ...process.env, BEAUTIFY_TEST_DIR: dir }, encoding: 'utf8', timeout: 120000 });
console.log(result.stdout || '');
console.error(result.stderr || '');
const report = path.join(dir, 'host-results.json');
if (result.error || !fs.existsSync(report)) {
  console.error(result.error || 'No integration test report was produced');
  process.exitCode = 1;
} else {
  const tests = JSON.parse(fs.readFileSync(report, 'utf8'));
  for (const test of tests) console.log(test.status, test.name, test.error || '');
  console.log(`Results: ${report}`);
  process.exitCode = result.status !== 0 || tests.some(test => test.status !== 'PASS') ? 1 : 0;
}
