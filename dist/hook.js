"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const sprintf_js_1 = require("sprintf-js");
const colors_1 = __importDefault(require("./colors"));
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const child_process_1 = require("child_process");
const node_emoji_1 = require("node-emoji");
const yurnalist_1 = __importDefault(require("yurnalist"));
class Hook {
    constructor(path) {
        this.path = path;
    }
    get name() {
        return path_1.default.basename(this.path);
    }
    get type() {
        return path_1.default.basename(path_1.default.dirname(this.path));
    }
    get dir() {
        return path_1.default.dirname(path_1.default.dirname(this.path));
    }
    get prettyDir() {
        return this.dir.replace(process.env["HOME"], "~");
    }
    get asReport() {
        return new Promise(async (resolve) => {
            resolve(sprintf_js_1.sprintf("%s %s %s", colors_1.default.dir(this.prettyDir), colors_1.default.script(this.name), await this.abstract));
        });
    }
    get abstract() {
        const stream = fs_1.default.createReadStream(this.path);
        const rl = readline_1.default.createInterface({ input: stream, crlfDelay: Infinity });
        return new Promise(async (resolve, reject) => {
            for await (const line of rl) {
                const m = line.match(/ABSTRACT:\s*(.*)/);
                if (m) {
                    rl.close();
                    resolve(m[1]);
                    return;
                }
            }
            resolve(null);
        });
    }
    async run(stdin) {
        yurnalist_1.default.info(`running hook '${this.name}'`);
        const x = child_process_1.spawn(this.path, [], {
            stdio: ["pipe", "inherit", "inherit"]
        });
        x.stdin.write(stdin);
        x.stdin.end();
        const result = await new Promise((resolve, reject) => {
            x.on("close", code => resolve(code));
        });
        if (result !== 0) {
            yurnalist_1.default.error(node_emoji_1.emojify("oh noes! Hook failed :face_vomiting:"));
            throw new Error("hook failed");
        }
        yurnalist_1.default.success("");
    }
}
exports.default = Hook;
