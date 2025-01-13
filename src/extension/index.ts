import * as fs from 'fs'
import * as vscode from 'vscode';
import { initDecorations } from './decorations';
import { detectCLIBinaryAtStart, initSearchxJSPath } from './callcli';
import { registerWebview } from './webviewProvider';
import { registerCommand } from './registerCommand';
import { initContext } from './context';
import { addCallbacks_WebViewInited, addCallbacks_VSCodeEditor } from './callbacks';

export async function activate(context: vscode.ExtensionContext) {
	initContext(context)

	console.log(`workspaceState : ${context.workspaceState}`)
	console.log(`extensionPath : ${context.extensionPath}`)
	console.log(`globalStorageUri : ${context.globalStorageUri.fsPath}`)
	let storagePath = context.storageUri?.fsPath
	if (storagePath) {
		console.log(`storagePath : ${storagePath}`)
		fs.mkdirSync(storagePath, { recursive: true })
	}

	await detectCLIBinaryAtStart()
	initSearchxJSPath(context)

	initDecorations();
	registerCommand(context)
	addCallbacks_VSCodeEditor(context)
	addCallbacks_WebViewInited(context)

	registerWebview(context)// 放到最后
}
