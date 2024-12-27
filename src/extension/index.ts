import * as vscode from 'vscode';
import { activateWebview } from './webviewProvider';
import { detectDefaultBinaryAtStart } from './callcli';
import { initSavedSearchOptions, registerCommand } from './registerCommand';
import * as fs from 'fs'
import { initWorker } from './worker';
import { registerEditorChanged } from './registerEditorChanged';
import { initDecorations } from './preview';

export async function activate(context: vscode.ExtensionContext) {

	console.log(`workspaceState : ${context.workspaceState}`)
	console.log(`extensionPath : ${context.extensionPath}`)
	console.log(`globalStorageUri : ${context.globalStorageUri.fsPath}`)
	let storagePath = context.storageUri?.fsPath
	if (storagePath) {
		console.log(`storagePath : ${storagePath}`)
		fs.mkdirSync(storagePath, { recursive: true })
	}
	initDecorations();
	await detectDefaultBinaryAtStart()
	initWorker(context)

	registerCommand(context)
	registerEditorChanged(context)

	initSavedSearchOptions(context)
	activateWebview(context)
}
