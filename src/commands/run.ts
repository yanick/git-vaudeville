
import { Vaudeville, hookTypes, HookPhase } from '../vaudeville';
import { PassThrough } from 'stream';
import fs from 'fs-extra';

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

    for ( const h of hooks ) {
        await h.run(input);
    }
}
