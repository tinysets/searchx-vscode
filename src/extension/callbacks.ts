import * as vscode from 'vscode'
import type { ChannelMessage } from 'unport'
import { parentPort } from './messageHub'
import { LocalSavedType, MessageType } from '../common/types'

function setupParentPort(webviewView: vscode.WebviewView) {
	parentPort.implementChannel({
		async send(message) {
			webviewView.webview.postMessage(message)
		},
		accept(pipe) {
			webviewView.webview.onDidReceiveMessage((message: ChannelMessage) => {
				pipe(message)
			})
		},
	})
}

export function onWebviewCreated(webviewView: vscode.WebviewView) {
	console.log('SearchX created');
	setupParentPort(webviewView)

	// 监听视图状态变化
	webviewView.onDidChangeVisibility(() => {
		let isSearchXActive = webviewView.visible;
		onWebviewVisibleChanged(isSearchXActive);
	});

	// 监听视图销毁
	webviewView.onDidDispose(() => {
		onWebviewDestroyed();
	});
}

function onWebviewDestroyed() {
	console.log('SearchX view disposed');
}

function onWebviewVisibleChanged(visible: boolean) {
	console.log('SearchX visibility changed:', visible);
}

export function addCallback_WebViewInited(context: vscode.ExtensionContext) {
	parentPort.onMessage(MessageType.C2S_WebViewInited, () => {
		let obj = context.workspaceState.get(LocalSavedType.SavedSearchOptions)
		if (obj) {
			parentPort.postMessage(MessageType.S2C_ReadSavedSearchOptions, obj)
		}

		setTimeout(() => {
			parentPort.onMessage(MessageType.C2S_SaveSearchOptions, (obj: any) => {
				context.workspaceState.update(LocalSavedType.SavedSearchOptions, obj)
			})
		}, 10)
	})
}

export function addCallbacks_Editor(context: vscode.ExtensionContext) {
	// 监听活动编辑器变化
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				// 触发重新添加 findDecorations
				console.log(`Switched to: ${editor.document.fileName}`);
			}
		})
	);

	// 监听文档内容变化
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(event => {
			const activeEditor = vscode.window.activeTextEditor;
			if (activeEditor && event.document === activeEditor.document) {
				// 触发重新添加 findDecorations
				console.log(`Document changed: ${event.contentChanges.length} changes`);
			}
		})
	);
}