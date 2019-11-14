import path from "path";
import { cache } from "decorator-cache-getter";
import { sprintf } from "sprintf-js";
import * as color from "./colors";

import fs from "fs-extra";
import readline from "readline";
import { spawn } from "child_process";
import { Readable } from "stream";
import util from "util";
import { emojify } from "node-emoji";

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

  get isEnabled() {
      return fs.access(this.path,fs.constants.X_OK).then(()=>true).catch(() => false);
  }

  get info() {
      // TODO add colors
      // TODO grey if hook is not enabled
      return (async () => {
      let info = await this.prettyName;

      const abstract = await this.abstract;
      if( abstract ) {
          info = info + "\n\t" + abstract;
      }

      return info;
      })();
  }

  get prettyName() {
      return (async () => {
      const nameColor = (await this.isEnabled) ? color.script : color.inexistent;
      let name =                     color.dir(this.prettyDir) + '/'
            + nameColor( this.name );
        if( !await this.isEnabled ) {
            name = name + emojify( ' :octagonal_sign:');
        }
        return name;
      })();
  }

  async run(stdin: string, args: string[]) {
    if(!await this.isEnabled ) return;

    report.info(emojify(`:runner: ${await this.prettyName}`));

    const x = spawn(this.path, args, {
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

    report.success(emojify(":100:"));
  }
}
