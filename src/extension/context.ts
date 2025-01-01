import * as vscode from 'vscode'

export let GContext: vscode.ExtensionContext;
export function initContext(context: vscode.ExtensionContext){
	GContext = context;
}