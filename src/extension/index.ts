import * as vscode from 'vscode';
import { activateWebview } from './webviewProvider';
import { activatePreview } from './preview';
import { detectDefaultBinaryAtStart } from './callcli';
import { registerCommand } from './registerCommand';

export async function activate(context: vscode.ExtensionContext) {
	await detectDefaultBinaryAtStart()
	activateWebview(context)
	activatePreview(context)
	registerCommand(context)
}