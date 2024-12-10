// Use a custom uri scheme to store
// vscode does not provide API to modify file content
// so we need to create a virtual file to host replacement preview
// and call the vscode.diff command to display the replacement.
// See relevant comments for TextDocumentContentProvider
// custom scheme comes from https://stackoverflow.com/a/69384899/2198656
import vscode, {
  Position,
  Range,
  Uri,
  commands,
  workspace,
} from 'vscode'
import {
  type ChildToParent,
} from '../common/types.js'

function workspaceUriFromFilePath(filePath: string) {
  const uris = workspace.workspaceFolders
  const { joinPath } = Uri
  if (!uris?.length) {
    return
  }
  return joinPath(uris?.[0].uri, filePath)
}

function locationToRange(
  locations: ChildToParent['openFile']['locationsToSelect'],
) {
  const { start, end } = locations
  return new Range(
    new Position(start.line, start.column),
    new Position(end.line, end.column),
  )
}

export function openFile({ filePath, locationsToSelect }: ChildToParent['openFile']) {
  const fileUri = workspaceUriFromFilePath(filePath)
  if (!fileUri) {
    return
  }
  const range = locationToRange(locationsToSelect)
  commands.executeCommand('vscode.open', fileUri, {
    selection: range,
    preserveFocus: true,
  })

  // const highlightDecorationType = vscode.window.createTextEditorDecorationType({
  //   backgroundColor: 'rgba(255, 255, 0, 0.3)',
  //   borderRadius: '3px',
  //   border: '1px solid yellow',
  //   color: 'red', // 文字颜色
  //   fontWeight: 'bold',
  //   textDecoration: 'underline'
  // });

  // // 常规搜索匹配的装饰器
  // let findDecorations = vscode.window.createTextEditorDecorationType({
  //   backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
  //   borderColor: new vscode.ThemeColor('editor.findMatchHighlightBorder'),
  //   // 滚动条槽（overview ruler）中的标记
  //   overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.findMatchForeground'),
  //   overviewRulerLane: vscode.OverviewRulerLane.Center,
  //   rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
  // });

  // // 当前活动匹配的装饰器
  // let activeMatchDecoration = vscode.window.createTextEditorDecorationType({
  //   backgroundColor: new vscode.ThemeColor('editor.findMatchBackground'),
  //   borderColor: new vscode.ThemeColor('editor.findMatchBorder'),
  //   // 滚动条槽中的活动匹配标记
  //   overviewRulerColor: new vscode.ThemeColor('editorOverviewRuler.findMatchForeground'),
  //   overviewRulerLane: vscode.OverviewRulerLane.Center,
  //   rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
  // });

  // const decorations = [{
  //   range: range
  // }];
  // const editor = vscode.window.activeTextEditor;
  // if (editor) {
  //   editor.setDecorations(activeMatchDecoration, decorations);
  // }

}
