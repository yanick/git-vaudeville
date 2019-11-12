"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const yurnalist_1 = __importDefault(require("yurnalist"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const vaudeville_1 = require("../vaudeville");
async function makeLocalVaudDir() {
    const dir = './.git/hooks/vaudeville';
    yurnalist_1.default.info(`creating the local vaudeville directory ${dir}`);
    await fs_extra_1.default.ensureDir(dir);
    const tick = yurnalist_1.default.progress(vaudeville_1.hookTypes.length);
    for (const subdir of vaudeville_1.hookTypes) {
        await fs_extra_1.default.ensureDir(path_1.default.join(dir, subdir));
        tick();
    }
    return dir;
}
const shim = `#!/usr/bin/env bash

git-vaudeville run \`basename $0\`
`;
async function installShims(dir) {
    const backup = path_1.default.join(dir, (new Date()).toISOString());
    const tick = yurnalist_1.default.progress(vaudeville_1.hookTypes.length);
    for (const hook of vaudeville_1.hookTypes) {
        yurnalist_1.default.info(`installing shim for hook '${hook}'`);
        const file = path_1.default.join(dir, hook);
        const needBackup = await fs_extra_1.default.readFile(file)
            .then(c => c.toString() !== shim).catch(() => false);
        if (needBackup) {
            console.info(`backing up ${file} into ${backup}`);
            await fs_extra_1.default.move(file, path_1.default.join(backup, file));
        }
        await fs_extra_1.default.writeFile(file, shim).then(() => fs_extra_1.default.chmod(file, 0o755));
        tick();
    }
}
async function install(vaudeville) {
    yurnalist_1.default.info(`installing git-vaudeville for ${process.cwd()}`);
    if (!await fs_extra_1.default.stat('.git').then(d => d.isDirectory()).catch(() => false)) {
        yurnalist_1.default.error("not in the root directory of a git repo, aborting");
        return;
    }
    const dir = await makeLocalVaudDir();
    await installShims('.git/hooks');
    yurnalist_1.default.success(":tadah:");
}
exports.default = install;
