const { execFile } = require('child_process');
const { v4: uuidv4 } = require('uuid');

class ContainerManager {
  /**
   * Run a command inside a new Docker container
   */
  async run({ image, hostDir, cmd, stdin, timeoutMs = 5000, memoryMB = 256, readOnlyHost = true }) {
    const containerName = `codearena-${uuidv4()}`;
    const volumeMount = readOnlyHost ? `${hostDir}:/code:ro` : `${hostDir}:/code:rw`;
    
    // Construct docker run arguments
    const dockerArgs = [
      'run',
      '--rm',
      `--memory=${memoryMB}m`,
      `--memory-swap=${memoryMB}m`,
      '--cpus=1',
      '--network=none',
      '--read-only',
      '--tmpfs', '/tmp:rw,size=64m',
      '--pids-limit=100', // prevent fork bombs
      '-v', volumeMount,
      '-w', '/code',
      '-i', // interactive for stdin
      '--name', containerName,
      image,
      '/bin/sh', '-c', cmd
    ];

    return new Promise((resolve) => {
      let stdoutData = '';
      let stderrData = '';
      let isDone = false;
      let timedOut = false;
      const startTime = Date.now();

      const child = execFile('docker', dockerArgs, (error, stdout, stderr) => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timeoutHandle);

        const executionTimeMs = Date.now() - startTime;
        let exitCode = 0;
        
        if (error) {
          exitCode = error.code || 1;
        }
        
        // 137 exit code from docker means it was OOM killed (or we forcefully killed it)
        if (exitCode === 137 && !timedOut) {
          stderrData += '\nMemory Limit Exceeded (OOM Killed)';
        } else if (exitCode === 126) {
          stderrData += '\nPermission denied (Cannot execute binary)';
        } else if (exitCode === 127) {
          stderrData += '\nCommand not found (Binary missing or sync failed)';
        }

        resolve({
          stdout: stdoutData,
          stderr: stderrData,
          exitCode,
          executionTimeMs,
          timedOut,
          memoryUsedMB: 0 // In a more complex setup we'd fetch docker stats, defaulting to 0 for now
        });
      });

      // Write stdin if provided
      if (stdin) {
        child.stdin.write(stdin);
        child.stdin.end();
      }

      child.stdout.on('data', (data) => {
        stdoutData += data;
        // Anti-abuse: truncate output if it's too large (e.g. > 1MB)
        if (stdoutData.length > 1024 * 1024) {
          child.kill('SIGKILL');
        }
      });

      child.stderr.on('data', (data) => {
        stderrData += data;
      });

      // Handle Timeout
      const timeoutHandle = setTimeout(() => {
        if (isDone) return;
        isDone = true;
        timedOut = true;
        
        // Force kill the docker container
        execFile('docker', ['rm', '-f', containerName], () => {
          resolve({
            stdout: stdoutData,
            stderr: stderrData,
            exitCode: 137,
            executionTimeMs: timeoutMs,
            timedOut: true,
            memoryUsedMB: 0
          });
        });
      }, timeoutMs);
    });
  }
}

module.exports = new ContainerManager();
