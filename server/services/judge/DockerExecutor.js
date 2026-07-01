const compilers = require('./compilers');
const containerManager = require('./containerManager');
const { compareOutput } = require('./verdictEvaluator');
const { createTempDir, writeTempFile, cleanupTempDir } = require('../../utils/tempFiles');

class DockerExecutor {
  async execute(code, language, testCases) {
    const config = compilers[language];
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    let tempDir = null;
    const results = {
      overallVerdict: 'Accepted',
      testCaseResults: [],
      totalTestCases: testCases.length,
      testCasesPassed: 0,
      maxExecutionTime: 0,
      maxMemoryUsed: 0,
      compilationError: null
    };

    try {
      // 1. Setup temp directory and write code file
      tempDir = await createTempDir();
      await writeTempFile(tempDir, config.fileName, code);

      // 2. Compilation Phase (if needed)
      if (config.needsCompilation) {
        const compileResult = await containerManager.run({
          image: config.image,
          hostDir: tempDir,
          cmd: config.compileCmd,
          timeoutMs: 15000, // 15 seconds for compilation
          readOnlyHost: false,
          memoryMB: 512 // g++ can use a lot of memory
        });

        if (compileResult.exitCode !== 0) {
          const stderrStr = compileResult.stderr || '';
          console.error(`\n[EXECUTION LOG] Compilation Failed! Exit Code: ${compileResult.exitCode}`);
          console.error(`[EXECUTION LOG] STDERR output:\n${stderrStr}\n`);

          if (stderrStr.includes('Unable to find image') || stderrStr.includes('docker: Error response from daemon')) {
            results.overallVerdict = 'System Error';
            results.compilationError = `Backend configuration error: Docker image '${config.image}' is missing or cannot be pulled. Please build the execution images as per the README.`;
            return results;
          }
          results.overallVerdict = 'Compilation Error';
          results.compilationError = compileResult.stderr || compileResult.stdout || 'Compilation failed with no output.';
          return results;
        }

        // Wait a bit for the compiled binary to sync to the host filesystem (macOS Docker issue)
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      // 3. Execution Phase
      for (let i = 0; i < testCases.length; i++) {
        // Small delay between testcases to prevent Docker daemon API socket exhaustion
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const tc = testCases[i];
        
        const runResult = await containerManager.run({
          image: config.image,
          hostDir: tempDir,
          cmd: config.runCmd,
          stdin: tc.input,
          timeoutMs: 5000 // 5 seconds execution limit per testcase
        });

        // Determine verdict for this test case
        let verdict = 'Accepted';
        if (runResult.timedOut) {
          verdict = 'TLE';
        } else if (runResult.exitCode === 137 || runResult.stderr.includes('Memory Limit Exceeded')) {
          verdict = 'MLE';
        } else if (runResult.stderr.includes('Unable to find image') || runResult.stderr.includes('docker: Error response from daemon')) {
          verdict = 'System Error';
          runResult.stderr = `Backend configuration error: Docker image '${config.image}' is missing or cannot be pulled. Please build the execution images as per the README.`;
          console.error(`\n[EXECUTION LOG] System Error on testcase ${i}: ${runResult.stderr}\n`);
        } else if (runResult.exitCode !== 0) {
          verdict = 'Runtime Error';
          console.error(`\n[EXECUTION LOG] Runtime Error on testcase ${i}! Exit Code: ${runResult.exitCode}`);
          console.error(`[EXECUTION LOG] STDERR output:\n${runResult.stderr}\n`);
        } else if (!tc.isCustom && !compareOutput(runResult.stdout, tc.output)) {
          verdict = 'Wrong Answer';
        }

        // Update stats
        results.maxExecutionTime = Math.max(results.maxExecutionTime, runResult.executionTimeMs);
        results.maxMemoryUsed = Math.max(results.maxMemoryUsed, runResult.memoryUsedMB);

        // Record test case result
        results.testCaseResults.push({
          verdict,
          isCustom: tc.isCustom,
          executionTimeMs: runResult.executionTimeMs,
          memoryUsedMB: runResult.memoryUsedMB,
          input: tc.isHidden ? undefined : tc.input,
          output: tc.isHidden ? undefined : runResult.stdout,
          expected: tc.isHidden ? undefined : tc.output,
          error: (verdict === 'Runtime Error') ? runResult.stderr : undefined
        });

        // Update overall verdict (Fail fast)
        if (verdict !== 'Accepted') {
          results.overallVerdict = verdict;
          break; // Stop running further test cases on first failure
        }

        results.testCasesPassed++;
      }

    } catch (error) {
      console.error('DockerExecutor Error:', error);
      results.overallVerdict = 'System Error';
      results.compilationError = error.message;
    } finally {
      // 4. Cleanup Phase
      if (tempDir) {
        await cleanupTempDir(tempDir);
      }
    }

    return results;
  }
}

module.exports = new DockerExecutor();
