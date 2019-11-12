"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function readStream(stream, encoding = "utf8") {
    stream.setEncoding(encoding);
    return new Promise((resolve, reject) => {
        let data = "";
        stream.on("data", (chunk) => data += chunk);
        stream.on("end", () => resolve(data));
        stream.on("error", (error) => reject(error));
    });
}
async function default_1(vaudeville, phase) {
    const hooks = (await vaudeville.hooks)[phase] || [];
    const input = await readStream(process.stdin);
    for (const h of hooks) {
        h.run(input);
    }
}
exports.default = default_1;
