import * as vscode from 'vscode';
import { activateWebview } from './webview';
import { activateSearch } from './search';

export function activate(context: vscode.ExtensionContext) {
	activateWebview(context)
	activateSearch(context)
}