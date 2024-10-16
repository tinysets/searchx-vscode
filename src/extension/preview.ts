// Use a custom uri scheme to store
// vscode does not provide API to modify file content
// so we need to create a virtual file to host replacement preview
// and call the vscode.diff command to display the replacement.
// See relevant comments for TextDocumentContentProvider
// custom scheme comes from https://stackoverflow.com/a/69384899/2198656
import {
  Position,
  Range,
  Uri,
  commands,
  workspace,
} from 'vscode'
import {
  type ChildToParent,
} from '../types.js'

function workspaceUriFromFilePath(filePath: string) {
  const uris = workspace.workspaceFolders
  const { joinPath } = Uri
  if (!uris?.length) {
    return
  }
  return joinPath(uris?.[0].uri, filePath)
}

function locationToRange(
  locations: ChildToParent['previewDiff']['locationsToSelect'],
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
}
