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

  for (const t of hookTypes) {
    if (!hooks[t]) continue;

    const hints: any = {};

    for (const h of hooks[t]) {
      const abstract = await h.abstract;
      hints[h.name] = `${h.prettyDir}${abstract ? " - " + abstract : ""}`;
    }

    report.log(t);
    report.list("", hooks[t].map(fp.get("name")), hints);
  }
}
