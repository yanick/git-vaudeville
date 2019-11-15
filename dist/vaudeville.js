"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const promise_1 = __importDefault(require("simple-git/promise"));
const fp_1 = __importDefault(require("lodash/fp"));
const hook_1 = __importDefault(require("./hook"));
exports.hookTypes = [
    "applypatch-msg",
    "post-commit",
    "pre-auto-gc",
    "pre-rebase",
    "commit-msg",
    "post-merge",
    "pre-commit",
    "pre-receive",
    "post-applypatch",
    "post-receive",
    "prepare-commit-msg",
    "update",
    "post-checkout",
    "pre-applypatch",
    "pre-push"
];
const getHooks = async (dir) => {
    let files = fp_1.default.flatten(await Promise.all(exports.hookTypes
        .map(h => path_1.default.join(dir, h))
        .map(dir => fs_extra_1.default
        .readdir(dir)
        .then(files => files.map(f => path_1.default.join(dir, f)))
        .catch(() => []))).catch(() => []));
    return fp_1.default.compact(await Promise.all(files.map((f) => fs_extra_1.default
        .access(f, fs_extra_1.default.constants.X_OK)
        .then(() => f)
        .catch(() => ""))).catch(() => []));
};
class Vaudeville {
    constructor() { }
    get vaudeville_dirs() {
        return (async () => {
            let rawDirs = await promise_1.default()
                .raw(["config", "vaudeville.dirs"])
                .catch(() => null);
            if (!rawDirs)
                rawDirs = "~/git/vaudeville,./.git/hooks/vaudeville";
            return rawDirs
                .split(",")
                .map(d => d.replace(/^~/, process.env["HOME"] || "~").replace("\n", ""));
        })();
    }
    get hooks() {
        return new Promise(async (resolve, reject) => {
            this.vaudeville_dirs
                .then(dirs => Promise.all(dirs.map(d => getHooks(d).catch(() => []))))
                .then(fp_1.default.flatten)
                .then(h => h.map(i => new hook_1.default(i)))
                .then(fp_1.default.sortBy("name"))
                .then(fp_1.default.groupBy("type"))
                .then((x) => resolve(x))
                .catch(() => resolve({}));
        });
    }
}
exports.Vaudeville = Vaudeville;
exports.default = Vaudeville;
