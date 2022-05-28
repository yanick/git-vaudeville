import { execSync, spawn } from "child_process";
import fp from "lodash/fp";
import path from "path";
import report from "yurnalist";
import fs from "fs-extra";
import { Vaudeville, hookTypes } from "../vaudeville";

async function makeLocalVaudDir() {
  const dir = "./.git/hooks/vaudeville";
  report.info(`creating the local vaudeville directory ${dir}`);

  await /* TODO: JSFIX could not patch the breaking change:
  Creating a directory with fs-extra no longer returns the path 
  Suggested fix: The returned promise no longer includes the path of the new directory */
  fs.ensureDir(dir);

  const tick = report.progress(hookTypes.length);

  for (const subdir of hookTypes) {
    await /* TODO: JSFIX could not patch the breaking change:
    Creating a directory with fs-extra no longer returns the path 
    Suggested fix: The returned promise no longer includes the path of the new directory */
    fs.ensureDir(path.join(dir, subdir));
    tick();
  }

  return dir;
}

const shim = `#!/usr/bin/env bash

git-vaudeville run \`basename $0\` "$@"
`;

async function installShims(dir: string) {
  const backup = path.join(dir, new Date().toISOString());

  const tick = report.progress(hookTypes.length);

  for (const hook of hookTypes) {
    report.info(`installing shim for hook '${hook}'`);

    const file = path.join(dir, hook);

    const needBackup = await fs
      .readFile(file)
      .then(c => c.toString() !== shim)
      .catch(() => false);

    if (needBackup) {
      console.info(`backing up ${file} into ${backup}`);
      await fs.move(file, path.join(backup, file));
    }

    await fs.writeFile(file, shim).then(() => fs.chmod(file, 0o755));
    tick();
  }
}

export default async function install(vaudeville: Vaudeville) {
  report.info(`installing git-vaudeville for ${process.cwd()}`);

  if (
    !(await fs
      .stat(".git")
      .then(d => d.isDirectory())
      .catch(() => false))
  ) {
    report.error("not in the root directory of a git repo, aborting");
    return;
  }

  const dir = await makeLocalVaudDir();

  await installShims(".git/hooks");

  report.success(":tadah:");
}
