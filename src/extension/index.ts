import * as vscode from 'vscode';
import { activateWebview } from './webviewProvider';
import { detectDefaultBinaryAtStart } from './callcli';
import { initSavedSearchOptions, registerCommand } from './registerCommand';
import * as fs from 'fs'
import { initWorker } from './worker';

export async function activate(context: vscode.ExtensionContext) {

	console.log(`workspaceState : ${context.workspaceState}`)
	console.log(`extensionPath : ${context.extensionPath}`)
	console.log(`globalStorageUri : ${context.globalStorageUri.fsPath}`)
	let storagePath = context.storageUri?.fsPath
	if (storagePath) {
		console.log(`storagePath : ${storagePath}`)
		fs.mkdirSync(storagePath, { recursive: true })
	}

	await detectDefaultBinaryAtStart()
	initWorker(context)

	registerCommand(context)
	initSavedSearchOptions(context)

	activateWebview(context)
}
