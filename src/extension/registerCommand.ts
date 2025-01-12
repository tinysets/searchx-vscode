import path from 'node:path'
import * as vscode from 'vscode'
import { window, commands, workspace } from 'vscode'
import { MessageType } from '../common/types'
import { parentPort } from './messageHub'
import { searchCLI, stopSearchCLI } from './searchCLI'
import { openFile } from './preview'
import { cacheResults } from './searchResult'

export function registerCommand(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		commands.registerCommand('searchx.searchInFolder', findInFolder),
		commands.registerCommand('searchx.searchInFile', findInFile),
		commands.registerCommand('searchx.refreshSearch', refreshSearch),
		commands.registerCommand('searchx.clearSearchResults', clearSearchResults),
		commands.registerCommand('searchx.expandAll', toggleAllSearch),
		commands.registerCommand('searchx.collapseAll', toggleAllSearch),
	)

	parentPort.onMessage(MessageType.C2S_Search, searchCLI)
	parentPort.onMessage(MessageType.C2S_StopSearch, stopSearchCLI)
	parentPort.onMessage(MessageType.C2S_OpenFile, openFile)
	parentPort.onMessage(MessageType.C2S_DismissOneMatch, dismissOneMatch)
	parentPort.onMessage(MessageType.C2S_DismissOneFile, dismissOneFile)
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
	parentPort.postMessage(MessageType.S2C_SetIncludeFile, {
		includeFile: relative,
	})
}
function findInFile(data: any) {
	const workspacePath = workspace.workspaceFolders?.[0]?.uri?.fsPath
	// compute relative path to the workspace folder
	const relative = workspacePath && path.relative(workspacePath, data.fsPath)
	if (!relative) {
		window.showErrorMessage('searchx Error: folder is not in the workspace')
		return
	}
	commands.executeCommand('searchx.search.input.focus')
	parentPort.postMessage(MessageType.S2C_SetIncludeFile, {
		includeFile: relative,
	})
}
function refreshSearch() {
	parentPort.postMessage(MessageType.S2C_RefreshAllSearch, {})
	if (cacheResults) {
		cacheResults.clear()
	}
}
function clearSearchResults() {
	parentPort.postMessage(MessageType.S2C_ClearSearchResults, {})
	if (cacheResults) {
		cacheResults.clear()
	}
}
function toggleAllSearch() {
	parentPort.postMessage(MessageType.S2C_ToggleAllSearch, {})
}
function dismissOneMatch(data: { fileAbsPath: string, uid: number }) {
	if (cacheResults) {
		cacheResults.dismissOneMatch(data.fileAbsPath, data.uid)
	}
}
function dismissOneFile(data: { fileAbsPath: string }) {
	if (cacheResults) {
		cacheResults.dismissOneFile(data.fileAbsPath)
	}
}
