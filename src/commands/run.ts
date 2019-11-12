
import { Vaudeville, hookTypes, HookPhase } from '../vaudeville';
import { PassThrough } from 'stream';
import fs from 'fs-extra';
import report from 'yurnalist';

function readStream(stream:any, encoding = "utf8") {

    stream.setEncoding(encoding);

    return new Promise((resolve, reject) => {
        let data = "";

        stream.on("data", (chunk:any) => data += chunk);
        stream.on("end", () => resolve(data));
        stream.on("error", (error:any) => reject(error));
    });
}

export default async function(vaudeville: Vaudeville,phase: HookPhase,
                              opts: Partial<{ stdin: string }>
) {
    const hooks = (await vaudeville.hooks )[phase] || [];

    const input = opts.stdin !== undefined ? opts.stdin : await readStream(process.stdin) as string;

    return hooks.reduce(
        (done,next) => done.then( () => next.run(input) ),
        Promise.resolve()
    ).catch(
        () => {
            report.error( "hook failed" );
            throw new Error( "hook failed" );
        }
    );
}
