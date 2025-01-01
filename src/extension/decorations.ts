import * as vscode from 'vscode'

export let activeMatchDecoration: vscode.TextEditorDecorationType;
export let findDecoration: vscode.TextEditorDecorationType;

export function initDecorations() {
  // const highlightDecorationType = vscode.window.createTextEditorDecorationType({
  //   backgroundColor: 'rgba(255, 255, 0, 0.3)',
  //   borderRadius: '3px',
  //   border: '1px solid yellow',
  //   color: 'red', // 文字颜色
  //   fontWeight: 'bold',
  //   textDecoration: 'underline'
  // });

  // https://code.visualstudio.com/api/references/theme-color

  // 当前活动匹配的装饰器
  activeMatchDecoration = vscode.window.createTextEditorDecorationType({
	backgroundColor: new vscode.ThemeColor('editor.findMatchBackground'),
	borderColor: new vscode.ThemeColor('editor.findMatchBorder'),
	// 滚动条槽中的活动匹配标记
	overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.findMatchForeground'),
	overviewRulerLane: vscode.OverviewRulerLane.Center,
	rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
  });

  // 常规搜索匹配的装饰器
  findDecoration = vscode.window.createTextEditorDecorationType({
	backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
	borderColor: new vscode.ThemeColor('editor.findMatchHighlightBorder'),
	// 滚动条槽（overview ruler）中的标记
	overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.findMatchForeground'),
	overviewRulerLane: vscode.OverviewRulerLane.Center,
	rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
  });
}

