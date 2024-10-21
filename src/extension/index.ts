import * as vscode from 'vscode';
import { activateWebview } from './webviewProvider';
import { detectDefaultBinaryAtStart } from './callcli';
import { registerCommand } from './registerCommand';

export async function activate(context: vscode.ExtensionContext) {
	await detectDefaultBinaryAtStart()
	activateWebview(context)
	registerCommand(context)

	console.log(`globalStorageUri : ${context.globalStorageUri.fsPath}`)
}