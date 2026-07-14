import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createUoid } from '@mmos/sdk';
import { CliCapabilityEngine } from './cli-capability-engine.js';

/**
 * Regression tests for the command-injection fix.
 *
 * Before the fix, task input was substituted into a single command string
 * and run via `exec(..., { shell: true })`. A value containing shell
 * metacharacters (`;`, `|`, `$(...)`, etc.) was interpreted by the shell,
 * letting task input execute arbitrary commands. These tests assert that a
 * malicious value is now treated as an inert literal argument by default.
 */
describe('CliCapabilityEngine - command injection fix', () => {
  const markerFile = join(tmpdir(), `mmos-cli-injection-test-${process.pid}.txt`);

  afterEach(() => {
    if (existsSync(markerFile)) unlinkSync(markerFile);
  });

  it('does NOT execute shell metacharacters embedded in task input by default (no shell)', async () => {
    const engine = new CliCapabilityEngine();
    // Use the Node binary itself as the "command": it's a real executable
    // guaranteed to exist on every platform (Linux, macOS, Windows), unlike
    // `echo`, which on Windows is only a cmd.exe builtin, not a standalone
    // .exe — that would fail to spawn under execFile() for an unrelated
    // (platform) reason and mask what this test is actually checking.
    engine.register('echo-test', 'test', {
      command: process.execPath,
      args: ['-e', 'process.stdout.write(process.argv[process.argv.length - 1])', '{value}'],
    });

    const maliciousValue = `hello; touch ${markerFile}`;

    const result = await engine.invoke({
      capabilityUoid: createUoid('cap', 'echo-test'),
      input: { category: 'test', name: 'echo-test', value: maliciousValue },
    });

    // The injected "touch <file>" must NOT have run.
    expect(existsSync(markerFile)).toBe(false);
    // The value must come back as one literal, unexecuted string.
    expect(result.output.stdout as string).toBe(maliciousValue);
  });

  it('rejects a base command not in the allow-list regardless of args', async () => {
    const engine = new CliCapabilityEngine({ allowedCommands: ['echo'] });
    engine.register('bad', 'test', { command: 'rm', args: ['-rf', '{target}'] });

    await expect(
      engine.invoke({
        capabilityUoid: createUoid('cap', 'bad'),
        input: { category: 'test', name: 'bad', target: '/tmp/whatever' },
      })
    ).rejects.toThrow(/not in the allowed list/);
  });

  // shellEscape() targets POSIX shell quoting (bash/sh). cmd.exe on Windows
  // has entirely different, notoriously inconsistent quoting rules, so this
  // particular guarantee doesn't apply there — skip rather than give a
  // false signal. The security-critical default path (no shell at all,
  // tested above) is platform-independent and unaffected by this.
  it.skipIf(process.platform === 'win32')(
    'still supports opt-in shell mode safely (value with a single quote round-trips literally)',
    async () => {
      const engine = new CliCapabilityEngine();
      engine.register('echo-shell', 'test', {
        command: 'echo',
        args: ['{value}'],
        shell: true,
      });

      const trickyValue = `it's ${markerFile.replace(/'/g, '')} safe`;

      const result = await engine.invoke({
        capabilityUoid: createUoid('cap', 'echo-shell'),
        input: { category: 'test', name: 'echo-shell', value: trickyValue },
      });

      expect(existsSync(markerFile)).toBe(false);
      expect((result.output.stdout as string).trim()).toBe(trickyValue);
    }
  );
});
