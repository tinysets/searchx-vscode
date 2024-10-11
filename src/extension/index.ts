import * as vscode from 'vscode';
import { activateWebview } from './webview';
import { activateSearch } from './search';
import { activatePreview } from './preview';

export function activate(context: vscode.ExtensionContext) {
	activateWebview(context)
	activateSearch(context)
	activatePreview(context)
}