import * as vscode from 'vscode';
import { activateWebview } from './webview';
import { activateSearch } from './search';
import { activatePreview } from './preview';
import { detectDefaultBinaryAtStart } from './common';

export async function activate(context: vscode.ExtensionContext) {
	await detectDefaultBinaryAtStart()
	activateWebview(context)
	activateSearch(context)
	activatePreview(context)
}