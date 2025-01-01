import { workspace } from 'vscode'
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
	// on windows, binary command is confusing like sh*t
	// different installation method and different shell will
	// resolve totally different binary
	// See:
	// https://zenn.dev/hd_nvim/articles/e49ef2c812ae8d#comment-0b861171ac40cb
	// https://github.com/ast-grep/ast-grep-vscode/issues/235
	// https://github.com/nodejs/node/issues/29532#issue-492569087
	for (const cmd of ['searchx', 'searchx.exe', 'searchx.cmd']) {
		if (await testBinaryExist(cmd)) {
			defaultBinary = cmd
			return
		}
	}
	// every possible command tried, fallback to ast-grep
	defaultBinary = 'searchx'
}

export function resolveBinary() {
	const config = workspace.getConfiguration('searchx').get('serverPath', '')
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
				shell: process.platform === 'win32',
				cwd: uris[0],
			},
			err => {
				r(!err)
			},
		)
	})
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
