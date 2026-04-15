import * as path from 'node:path';
import { pathExists as pathExistsFn, readdir, remove, copy, ensureDir } from './fs-utils.js';

export async function cleanDirectory(
  targetPath: string,
  expectedFiles: Set<string>
): Promise<void> {
  if (!(await pathExistsFn(targetPath))) return;

  const entries = await readdir(targetPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      await cleanDirectory(entryPath, expectedFiles);
      const remaining = await readdir(entryPath);
      if (remaining.length === 0) {
        await remove(entryPath);
      }
    } else {
      const relative = path.relative(targetPath, entryPath);
      if (!expectedFiles.has(relative) && !expectedFiles.has(entryPath)) {
        await remove(entryPath);
      }
    }
  }
}

export async function mirrorSync(
  sourceDir: string,
  targetDir: string
): Promise<void> {
  if (!(await pathExistsFn(targetDir))) {
    await copy(sourceDir, targetDir);
    return;
  }

  const sourceFiles = await listFilesRecursive(sourceDir);
  const targetFiles = await listFilesRecursive(targetDir);

  const sourceSet = new Set(sourceFiles.map((f) => path.relative(sourceDir, f)));
  const targetSet = new Set(targetFiles.map((f) => path.relative(targetDir, f)));

  for (const file of Array.from(targetSet)) {
    if (!sourceSet.has(file)) {
      await remove(path.join(targetDir, file));
    }
  }

  for (const file of Array.from(sourceSet)) {
    const src = path.join(sourceDir, file);
    const dest = path.join(targetDir, file);
    await ensureDir(path.dirname(dest));
    await copy(src, dest);
  }
}

async function listFilesRecursive(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listFilesRecursive(fullPath)));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}
