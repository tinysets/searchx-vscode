import type { ParentPort } from '../types.js'
import { Unport } from 'unport'
import { workspace } from 'vscode'
import { execFile } from 'node:child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'

export const parentPort: ParentPort = new Unport()

let defaultBinary: string = 'searchx.cmd'

export function resolveBinary() {
	return defaultBinary
}

export function streamedPromise<T>(
	proc: ChildProcessWithoutNullStreams,
	handler: (r: T[]) => void,
): Promise<number> {
	// don't concatenate a single string/buffer
	// only maintain the last trailing line
	let trailingLine = ''
	// stream parsing JSON
	proc.stdout.setEncoding('utf8')
	proc.stdout.on('data', (data: string) => {
		// collect results in this batch
		console.log('result=> ', data)
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
	})
	return new Promise((resolve, reject) =>
		proc.on('exit', (code, signal) => {
			// exit without signal, search ends correctly
			// TODO: is it correct now?
			if (!signal && code === 0) {
				resolve(code)
			} else {
				reject([code, signal])
			}
		}),
	)
}
