import path from 'node:path'
import * as vscode from 'vscode'
import { window, commands, workspace } from 'vscode'
import { MessageType } from '../common/types'
import { parentPort } from './messageHub'
import { searchInCLI, stopSearchCLI } from './search'
import { openFile } from './preview'

export function registerCommand(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		commands.registerCommand('searchx.searchInFolder', findInFolder),
		commands.registerCommand('searchx.refreshSearch', refreshSearch),
		commands.registerCommand('searchx.clearSearchResults', clearSearchResults),
		commands.registerCommand('searchx.expandAll', toggleAllSearch),
		commands.registerCommand('searchx.collapseAll', toggleAllSearch),
	)
}

function findInFolder(data: any) {
	const workspacePath = workspace.workspaceFolders?.[0]?.uri?.fsPath
	// compute relative path to the workspace folder
	const relative = workspacePath && path.relative(workspacePath, data.fsPath)
	if (!relative) {
		window.showErrorMessage('searchx Error: folder is not in the workspace')
		return
	}
	commands.executeCommand('searchx.search.input.focus')
	parentPort.postMessage(MessageType.SetIncludeFile, {
		includeFile: relative,
	})
}

function refreshSearch() {
	parentPort.postMessage(MessageType.RefreshAllSearch, {})
}

function clearSearchResults() {
	parentPort.postMessage(MessageType.ClearSearchResults, {})
}

function toggleAllSearch() {
	parentPort.postMessage(MessageType.ToggleAllSearch, {})
}

parentPort.onMessage(MessageType.OpenFile, openFile)
parentPort.onMessage(MessageType.Search, searchInCLI)

parentPort.onMessage(MessageType.StopSearch, stopSearch)
function stopSearch() {
	stopSearchCLI()
}