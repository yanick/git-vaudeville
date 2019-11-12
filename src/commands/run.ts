
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

export default async function(vaudeville: Vaudeville,phase: HookPhase
) {
    const hooks = (await vaudeville.hooks )[phase] || [];

    const input = await readStream(process.stdin) as string;

    for ( const h of hooks ) {
        h.run(input)
    }
}
