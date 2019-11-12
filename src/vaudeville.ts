import path from 'path';
import fp from 'lodash/fp';
import fs from 'fs-extra';
import Hook from './hook';

export const hookTypes = [
  'applypatch-msg',
  'post-commit',
  'pre-auto-gc',
  'pre-rebase',
  'commit-msg',
  'post-merge',
  'pre-commit',
  'pre-receive',
  'post-applypatch',
  'post-receive',
  'prepare-commit-msg',
  'update',
  'post-checkout',
  'pre-applypatch',
  'pre-push',
];

export type HookPhase = 'applypatch-msg'|
  'post-commit'|
  'pre-auto-gc'|
  'pre-rebase'|
  'commit-msg'|
  'post-merge'|
  'pre-commit'|
  'pre-receive'|
  'post-applypatch'|
  'post-receive'|
  'prepare-commit-msg'|
  'update'|
  'post-checkout'|
  'pre-applypatch'|
  'pre-push';

const getHooks = async (dir: string) => {
  let files = fp.flatten(
    await Promise.all(
      hookTypes
        .map(h => path.join(dir, h))
        .map(dir =>
          fs
            .readdir(dir)
            .then(files => files.map(f => path.join(dir, f)))
            .catch(() => []),
        ),
    ).catch(() => []),
  );

  return fp.compact(
    await Promise.all(
      files.map(
        (f: unknown): Promise<string> =>
          fs
            .access(f as string, fs.constants.X_OK)
            .then(() => f as string)
            .catch(() => ''),
      ),
    ).catch(() => []),
  );
};

export class Vaudeville {

  constructor() {}

  get vaudeville_dirs() {
    return [
      path.join(process.env['HOME'] as string, 'git/vaudeville'),
      './.git/hooks/vaudeville',
    ];
  }

  get hooks() {
    return Promise.all(this.vaudeville_dirs.map(getHooks)).catch(() => [])
        .then( fp.flatten ).then( h => h.map( i => new Hook(i) ) )
        .then( fp.sortBy('name' ) )
        .then( fp.groupBy( 'type' ) ) as Promise<{
            [t: string]: Hook[]
        }>;
  }

}

export default Vaudeville;
