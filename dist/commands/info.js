"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yurnalist_1 = __importDefault(require("yurnalist"));
const fs_1 = __importDefault(require("fs"));
const vaudeville_1 = require("../vaudeville");
const node_emoji_1 = require("node-emoji");
async function list(vaudeville) {
    yurnalist_1.default.log("Vaudeville directories");
    yurnalist_1.default.list("", (await vaudeville.vaudeville_dirs).map(dir => {
        try {
            fs_1.default.statSync(dir).isDirectory;
        }
        catch {
            dir = dir + " (not present)";
        }
        return dir;
    }));
    yurnalist_1.default.log("");
    const hooks = await vaudeville.hooks;
    if (Object.values(hooks).every(h => h.length === 0)) {
        yurnalist_1.default.log(node_emoji_1.emojify("not a single hook found :cry:"));
    }
    for (const t in hooks) {
        if (!vaudeville_1.hookTypes.includes(t)) {
            yurnalist_1.default.log(node_emoji_1.emojify(`${t} (custom phase :sparkles:)`));
        }
        else {
            yurnalist_1.default.log(t);
        }
        Promise.all(hooks[t].map(h => h.info)).then(lines => yurnalist_1.default.list('', lines));
    }
}
exports.default = list;
