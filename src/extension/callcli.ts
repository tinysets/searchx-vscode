import { workspace } from 'vscode'
import * as vscode from 'vscode'
import { execFile } from 'node:child_process'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'


let defaultBinary: string;

export async function detectCLIBinaryAtStart() {
	if (defaultBinary) {
		return
	}
	if (process.platform !== 'win32') {
		defaultBinary = 'searchx'
		return
	}

	for (const cmd of ['searchx', 'searchx.exe', 'searchx.cmd']) {
		if (await testBinaryExist(cmd)) {
			defaultBinary = cmd
			return
		}
	}
	defaultBinary = 'searchx'
}

export function resolveBinary() {
	const config = workspace.getConfiguration('searchx').get('binPath', '')
	if (!config) {
		return defaultBinary
	}
	return config
}

async function testBinaryExist(command: string) {
	const uris = workspace.workspaceFolders?.map(i => i.uri?.fsPath) ?? []
	return new Promise(r => {
		execFile(
			command,
			['-h'],
			{
				// for windows
				shell: true,
				cwd: uris[0],
				env: {
					...process.env,  // 继承当前环境变量
					VSCODE_DEV: '',
					ELECTRON_RUN_AS_NODE: '1'
				}
			},
			err => {
				r(!err)
			},
		)
	})
}

let searchxJSPath = ''
export function initSearchxJSPath(context: vscode.ExtensionContext) {
    let path = vscode.Uri.joinPath(context.extensionUri, 'out', 'searchx.cjs');
    searchxJSPath = path.fsPath;
    console.log(`searchxJSPath: ${searchxJSPath}`)
}
export function resolveSearchxJSPath() {
	return searchxJSPath
}

export function promisifyProc<T>(
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
		// console.log('result=> \n', data)
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
