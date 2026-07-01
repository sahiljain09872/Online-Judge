const os = require('os');
const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

async function createTempDir() {
  const dir = path.join(os.tmpdir(), 'codearena', uuidv4());
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function writeTempFile(dir, fileName, content) {
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, content);
  return filePath;
}

async function cleanupTempDir(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (err) {
    console.error(`Failed to cleanup temp dir ${dir}:`, err);
  }
}

module.exports = {
  createTempDir,
  writeTempFile,
  cleanupTempDir
};
