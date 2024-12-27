import * as vscode from 'vscode'

export function registerEditorChanged(context: vscode.ExtensionContext) {
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
