import * as vscode from 'vscode';
import { activateWebview } from './webview';

export function activate(context: vscode.ExtensionContext) {
	activateWebview(context)
}