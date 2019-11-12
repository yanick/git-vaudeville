"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fp_1 = __importDefault(require("lodash/fp"));
const yurnalist_1 = __importDefault(require("yurnalist"));
const fs_1 = __importDefault(require("fs"));
const vaudeville_1 = require("../vaudeville");
const node_emoji_1 = require("node-emoji");
async function list(vaudeville) {
    yurnalist_1.default.log('Vaudeville directories');
    yurnalist_1.default.list('', vaudeville.vaudeville_dirs.map(dir => {
        try {
            fs_1.default.statSync(dir).isDirectory;
        }
        catch {
            dir = dir + ' (not present)';
        }
        return dir;
    }));
    yurnalist_1.default.log('');
    const hooks = await vaudeville.hooks;
    if (Object.values(hooks).every(h => h.length === 0)) {
        yurnalist_1.default.log(node_emoji_1.emojify("not a single hook found :cry:"));
    }
    for (const t of vaudeville_1.hookTypes) {
        if (!hooks[t])
            continue;
        const hints = {};
        for (const h of hooks[t]) {
            const abstract = await h.abstract;
            hints[h.name] = `${h.prettyDir}${abstract ? ' - ' + abstract : ''}`;
        }
        yurnalist_1.default.log(t);
        yurnalist_1.default.list('', hooks[t].map(fp_1.default.get('name')), hints);
    }
}
exports.default = list;
