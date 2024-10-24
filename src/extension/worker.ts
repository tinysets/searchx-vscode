import * as vscode from 'vscode';
import { Worker } from 'node:worker_threads';

let searchxPath = ''
export function initWorker(context: vscode.ExtensionContext) {
    let path = vscode.Uri.joinPath(context.extensionUri, 'out', 'searchx.cjs');
    searchxPath = path.fsPath;
    console.log(`searchxPath: ${searchxPath}`)
}

export function workerPromise<T>(
    handler: (r: T[]) => void,
    data: any
) {
    const worker = new Worker(searchxPath, { workerData: data });

    let trailingLine = ''
    worker.on('message', (data) => {
        // collect results in this batch
        console.log('result=> \n', data)
        const result: T[] = []
        const lines = (trailingLine + data).split(/\r?\n/) // 每一行都是一个json结果,否则就丢弃
        trailingLine = ''
        for (let i = 0; i < lines.length; i++) {
            try {
                result.push(JSON.parse(lines[i]))
            } catch (e) {
                // only store the last non-json line
                if (i === lines.length - 1) {
                    trailingLine = lines[i]
                }
            }
        }
        handler(result)
    });
    let promise = new Promise((resolve, reject) => {
        worker.on('error', (error) => {
            // console.log('error:', error);
            reject()
        });
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject()
                // console.log(`Worker stopped with exit code ${code}`);
            } else {
                resolve(code)
                // console.log('Worker stopped');
            }
        });
    })
    return { worker, promise }
}