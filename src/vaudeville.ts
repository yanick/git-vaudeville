import path from "path";
import fs from "fs-extra";

import git from "simple-git/promise";

import fp from "lodash/fp";
import Hook from "./hook";

export const hookTypes = [
  "applypatch-msg",
  "post-commit",
  "pre-auto-gc",
  "pre-rebase",
  "commit-msg",
  "post-merge",
  "pre-commit",
  "pre-receive",
  "post-applypatch",
  "post-receive",
  "prepare-commit-msg",
  "update",
  "post-checkout",
  "pre-applypatch",
  "pre-push"
];

export type HookPhase =
  | "applypatch-msg"
  | "post-commit"
  | "pre-auto-gc"
  | "pre-rebase"
  | "commit-msg"
  | "post-merge"
  | "pre-commit"
  | "pre-receive"
  | "post-applypatch"
  | "post-receive"
  | "prepare-commit-msg"
  | "update"
  | "post-checkout"
  | "pre-applypatch"
  | "pre-push";

async function myReaddir(dir :string) {
    return fs.readdir(dir).then( entries => entries.map( e => path.join(dir,e) ) )
    .catch( ()=>[] );
}

const getHooks = async (dir: string): Promise<string[]> => {
  return ( myReaddir(dir)  as any
         )
    .then( (subdirs:string[]) => subdirs.map( d => myReaddir(d) ) )
    .then( (d:any) => Promise.all(d) )
    .then( fp.flatten );
}

export class Vaudeville {
  constructor() {}

  get vaudeville_dirs(): Promise<string[]> {
    return (async () => {
      let rawDirs = await git()
        .raw(["config", "vaudeville.dirs"])
        .catch(() => null);

      if (!rawDirs) rawDirs = "~/git/vaudeville,./.git/hooks/vaudeville";

      return rawDirs
        .split(",")
        .map(d =>
          d.replace(/^~/, process.env["HOME"] || "~").replace("\n", "")
        );
    })();
  }

  get hooks(): Promise<{ [t: string]: Hook[] }> {
    return new Promise(async (resolve, reject) => {
      this.vaudeville_dirs
        .then(dirs => Promise.all(dirs.map(d => getHooks(d).catch(() => []))))
        .then(fp.flatten)
        .then(h => h.map(i => new Hook(i)))
        .then(fp.sortBy("name"))
        .then(fp.groupBy("type"))
        .then((x: any) => resolve(x))
        .catch(() => resolve({}));
    });
  }
}

export default Vaudeville;
