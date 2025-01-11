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
  OpenFileResult,
  RangeInfo,
} from '../common/types'
import { activeMatchDecoration, findDecoration } from './decorations'
import path from 'node:path'
import { cacheResults } from './searchResult'

function workspaceUriFromFilePath(filePath: string) {
  if (path.isAbsolute(filePath)) {
    return Uri.file(filePath)
  }
  const uris = workspace.workspaceFolders
  const { joinPath } = Uri
  if (!uris?.length) {
    return
  }
  return joinPath(uris?.[0].uri, filePath)
}

function locationToRange(locations: RangeInfo) {
  const { start, end } = locations
  return new Range(
    new Position(start.line, start.column),
    new Position(end.line, end.column),
  )
}

export async function openFile({ fileResult, matchIndex }: OpenFileResult) {
  const fileUri = workspaceUriFromFilePath(fileResult.fileAbsPath)
  if (!fileUri) {
    return
  }
  const locationSelect = fileResult.results[matchIndex].range
  const rangeSelect = locationToRange(locationSelect)
  await commands.executeCommand('vscode.open', fileUri, {
    selection: rangeSelect,
    preserveFocus: true,
  })

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  editor.setDecorations(findDecoration, []); // clear
  editor.setDecorations(activeMatchDecoration, []); // clear

  const findDecorationRanges: { range: vscode.Range }[] = [];
  const activeMatchDecorationRanges: { range: vscode.Range }[] = [];

  for (let i = 0; i < fileResult.results.length; i++) {
    const range = locationToRange(fileResult.results[i].range);
    if (i === matchIndex) {
      activeMatchDecorationRanges.push({ range });
    } else {
      findDecorationRanges.push({ range });
    }
  }

  editor.setDecorations(findDecoration, findDecorationRanges);
  editor.setDecorations(activeMatchDecoration, activeMatchDecorationRanges);
}

export async function highlightResultInTextEditor() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  editor.setDecorations(findDecoration, []); // clear
  editor.setDecorations(activeMatchDecoration, []); // clear

  if (!cacheResults)
    return;
  let fsPath = editor.document.uri.fsPath
  if (!fsPath)
    return;
  const fileResult = cacheResults.groupsMap.get(fsPath);
  if (!fileResult)
    return;

  const findDecorationRanges: { range: vscode.Range }[] = [];
  const activeMatchDecorationRanges: { range: vscode.Range }[] = [];

  for (let i = 0; i < fileResult.results.length; i++) {
    const range = locationToRange(fileResult.results[i].range);
    findDecorationRanges.push({ range });
  }

  editor.setDecorations(findDecoration, findDecorationRanges);
  editor.setDecorations(activeMatchDecoration, activeMatchDecorationRanges);
}