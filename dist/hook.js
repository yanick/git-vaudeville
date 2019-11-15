"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const sprintf_js_1 = require("sprintf-js");
const color = __importStar(require("./colors"));
const fs_extra_1 = __importDefault(require("fs-extra"));
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
            resolve(sprintf_js_1.sprintf("%s %s %s", color.dir(this.prettyDir), color.script(this.name), await this.abstract));
        });
    }
    get abstract() {
        const stream = fs_extra_1.default.createReadStream(this.path);
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
    get isEnabled() {
        return fs_extra_1.default
            .access(this.path, fs_extra_1.default.constants.X_OK)
            .then(() => true)
            .catch(() => false);
    }
    get info() {
        return (async () => {
            let info = await this.prettyName;
            const abstract = await this.abstract;
            if (abstract) {
                info = info + "\n\t" + abstract;
            }
            return info;
        })();
    }
    get prettyName() {
        return (async () => {
            const nameColor = (await this.isEnabled)
                ? color.script
                : color.inexistent;
            let name = color.dir(this.prettyDir) + "/" + nameColor(this.name);
            if (!(await this.isEnabled)) {
                name = name + node_emoji_1.emojify(" :octagonal_sign:");
            }
            return name;
        })();
    }
    async run(stdin, args) {
        if (!(await this.isEnabled))
            return;
        yurnalist_1.default.info(node_emoji_1.emojify(`:runner: ${await this.prettyName}`));
        const x = child_process_1.spawn(this.path, args, {
            stdio: ["pipe", "inherit", "inherit"]
        });
        x.stdin.write(stdin);
        x.stdin.end();
        const result = await new Promise((resolve, reject) => {
            x.on("close", code => resolve(code));
        });
        if (result !== 0) {
            throw new Error("hook failed");
        }
        yurnalist_1.default.success(node_emoji_1.emojify(":100:"));
    }
}
exports.default = Hook;
