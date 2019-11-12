import path from "path";
import { cache } from "decorator-cache-getter";
import { sprintf } from "sprintf-js";
import color from "./colors";

import fs from "fs";
import readline from "readline";
import { spawn } from "child_process";
import { Readable } from "stream";
import util from "util";

import report from "yurnalist";

export default class Hook {
  path: string;

  constructor(path: string) {
    this.path = path;
  }

  get name() {
    return path.basename(this.path);
  }

  get type() {
    return path.basename(path.dirname(this.path));
  }

  get dir() {
    return path.dirname(path.dirname(this.path));
  }

  get prettyDir() {
    return this.dir.replace(process.env["HOME"] as string, "~");
  }

  get asReport() {
    return new Promise(async resolve => {
      resolve(
        sprintf(
          "%s %s %s",
          color.dir(this.prettyDir),
          color.script(this.name),
          await this.abstract
        )
      );
    });

    // TODO add info if disabled
    // TODO add ABSTRACT
  }

  get abstract() {
    const stream = fs.createReadStream(this.path);
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

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

  async run(stdin: string) {
    report.info(`running hook ${this.name}`);

    const x = spawn(this.path, [], {
      stdio: ["pipe", "inherit", "inherit"]
    });
    x.stdin.write(stdin);
    x.stdin.end();

    const result = await new Promise((resolve, reject) => {
      x.on("close", code => resolve(code));
    });

    if (result !== 0) {
      report.error("oh noes! Hook failed");
      throw new Error("hook failed");
    }

    report.success("");
  }
}
