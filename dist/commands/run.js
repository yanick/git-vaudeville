"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yurnalist_1 = __importDefault(require("yurnalist"));
const node_emoji_1 = require("node-emoji");
function readStream(stream, encoding = "utf8") {
    stream.setEncoding(encoding);
    return new Promise((resolve, reject) => {
        let data = "";
        stream.on("data", (chunk) => (data += chunk));
        stream.on("end", () => resolve(data));
        stream.on("error", (error) => reject(error));
    });
}
async function default_1(vaudeville, phase, opts) {
    const hooks = (await vaudeville.hooks)[phase] || [];
    if (hooks.length === 0) {
        return;
    }
    yurnalist_1.default.info(node_emoji_1.emojify(`:fishing_pole_and_fish: ${phase}`));
    const input = opts.stdin !== undefined
        ? opts.stdin
        : process.stdin.isTTY
            ? ""
            : (await readStream(process.stdin));
    return hooks
        .reduce((soFar, next) => soFar.then(() => next.run(input)), Promise.resolve())
        .catch(e => e);
}
exports.default = default_1;
