import {execSync, spawn} from 'child_process';
import fp from 'lodash/fp';
import path from 'path';
import report from 'yurnalist';
import fs from 'fs';
import {Vaudeville, hookTypes} from '../vaudeville';

export default async function list(vaudeville: Vaudeville) {
  report.log('Vaudeville directories');
  report.list(
    '',
    vaudeville.vaudeville_dirs.map(dir => {
      try {
        fs.statSync(dir).isDirectory;
      } catch {
        dir = dir + ' (not present)';
      }
      return dir;
    }),
  );

  const hooks = await vaudeville.hooks;

  for (const t of hookTypes) {
    if (!hooks[t]) continue;

    const hints: any = {};

    for (const h of hooks[t]) {
      const abstract = await h.abstract;
      hints[h.name] = `${h.prettyDir}${abstract ? ' - ' + abstract : ''}`;
    }

    report.log(t);
    report.list('', hooks[t].map(fp.get('name')), hints);
  }
}
