import { execSync, spawn } from "child_process";
import fp from "lodash/fp";
import path from "path";
import report from "yurnalist";
import fs from "fs";
import { Vaudeville, hookTypes } from "../vaudeville";
import { emojify } from "node-emoji";

export default async function list(vaudeville: Vaudeville) {
  report.log("Vaudeville directories");
  report.list(
    "",
    (await vaudeville.vaudeville_dirs).map(dir => {
      try {
        fs.statSync(dir).isDirectory;
      } catch {
        dir = dir + " (not present)";
      }
      return dir;
    })
  );

  report.log("");

  const hooks = await vaudeville.hooks;

  if (Object.values(hooks).every(h => h.length === 0)) {
    report.log(emojify("not a single hook found :cry:"));
  }

  for (const t in hooks) {

    // TODO show that a hook is inactive if it's not +x
    if( !hookTypes.includes(t) ) {
        report.log( emojify( `${t} (custom phase :sparkles:)` ) )
    }
    else { report.log(t); }

    Promise.all(hooks[t].map( h => h.info ) ).then(
        lines => report.list( '', lines )
    );
  }
}
