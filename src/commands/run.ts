import { Vaudeville, hookTypes, HookPhase } from "../vaudeville";
import { PassThrough } from "stream";
import fs from "fs-extra";
import report from "yurnalist";
import { emojify } from "node-emoji";

function readStream(stream: any, encoding = "utf8") {
  stream.setEncoding(encoding);

  return new Promise((resolve, reject) => {
    let data = "";

    stream.on("data", (chunk: any) => (data += chunk));
    stream.on("end", () => resolve(data));
    stream.on("error", (error: any) => reject(error));
  });
}

export default async function(
  vaudeville: Vaudeville,
  phase: HookPhase,
  args: string[],
  opts: Partial<{ stdin: string }>
) {
  const hooks = (await vaudeville.hooks)[phase] || [];

  if (hooks.length === 0) {
    return;
  }

  report.info(emojify(`:fishing_pole_and_fish: ${phase}`));

  const input =
    opts.stdin !== undefined
      ? opts.stdin
      : process.stdin.isTTY
      ? ""
      : ((await readStream(process.stdin)) as string);

      try {
    for ( const hook of hooks ) {
        await hook.run(input,args);
    }
      } catch(e) {
          report.error(emojify("oh noes! Hook failed :face_vomiting:"));
          throw e;
      }

    return;
}
