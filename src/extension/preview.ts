// Use a custom uri scheme to store
// vscode does not provide API to modify file content
// so we need to create a virtual file to host replacement preview
// and call the vscode.diff command to display the replacement.
// See relevant comments for TextDocumentContentProvider
// custom scheme comes from https://stackoverflow.com/a/69384899/2198656
import {
  type CancellationToken,
  type ExtensionContext,
  Position,
  Range,
  type TextDocument,
  type TextDocumentContentProvider,
  Uri,
  commands,
  window,
  workspace,
  TabInputTextDiff,
  EventEmitter,
} from 'vscode'
import {
  type ChildToParent,
  type SearchQuery,
} from '../types.js'

const SCHEME = 'sgpreview'
let lastPattern = ''

/**
 * NB A file will only have one preview at a time
 * last rewrite will replace older rewrites
 * key: path, value: string content
 **/
const previewContents: Map<string, string> = new Map()

class AstGrepPreviewProvider implements TextDocumentContentProvider {
  private emitter = new EventEmitter<Uri>()
  onDidChange = this.emitter.event

  // TODO: add cancellation
  provideTextDocumentContent(uri: Uri, _token: CancellationToken): string {
    return previewContents.get(uri.path) || ''
  }

  notifyDiffChange(uri: Uri) {
    this.emitter.fire(uri)
  }
}
const previewProvider = new AstGrepPreviewProvider()

function isSgPreviewUri(uri: Uri) {
  return uri.scheme === SCHEME
}

function cleanupDocument(doc: TextDocument) {
  const uri = doc.uri
  if (!isSgPreviewUri(uri)) {
    return
  }
  previewContents.delete(uri.path)
}

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


function closeAllDiffs() {
  console.debug('Search pattern changed. Closing all diffs.')
  const tabs = window.tabGroups.all.flatMap(tg => tg.tabs)
  for (const tab of tabs) {
    const input = tab.input
    if (input instanceof TabInputTextDiff && isSgPreviewUri(input.modified)) {
      window.tabGroups.close(tab, true)
    }
  }
}

export function refreshDiff(query: SearchQuery) {
  try {
    // Clear cache if pattern/rewrite changed
    if (query.pattern !== lastPattern) {
      previewContents.clear()
    }
    if (query.pattern !== lastPattern) {
      closeAllDiffs()
      return
    }
  } finally {
    // use finally to ensure updated
    lastPattern = query.pattern
  }
}

// parentPort.onMessage('commitChange', onCommitChange)
// parentPort.onMessage('replaceAll', onReplaceAll)

// async function onReplaceAll(payload: ChildToParent['replaceAll']) {
//   const confirmed = await window.showInformationMessage(
//     'Replace all occurrences across all files?',
//     { modal: true },
//     'Replace',
//   )
//   if (confirmed !== 'Replace') {
//     return
//   }
//   const { id, pattern, rewrite, selector, strictness, lang } = payload
//   for (const change of payload.changes) {
//     // TODO: chunk change
//     await onCommitChange({
//       id,
//       pattern,
//       rewrite,
//       selector,
//       strictness,
//       lang,
//       ...change,
//     })
//   }
// }

// async function onCommitChange(payload: ChildToParent['commitChange']) {
//   const { filePath, pattern, rewrite, strictness, selector, lang } = payload
//   const fileUri = workspaceUriFromFilePath(filePath)
//   if (!fileUri) {
//     return
//   }
//   await doChange(fileUri, payload)
//   await refreshSearchResult(payload.id, fileUri, {
//     pattern,
//     rewrite,
//     strictness,
//     selector,
//     lang,
//     includeFile: filePath,
//   })
// }

// async function doChange(
//   fileUri: Uri,
//   { diffs }: ChildToParent['commitChange'],
// ) {
//   const bytes = await workspace.fs.readFile(fileUri)
//   const { receiveResult, conclude } = bufferMaker(bytes)
//   for (const { range, replacement } of diffs) {
//     receiveResult(replacement, range.byteOffset)
//   }
//   const final = conclude()
//   await workspace.fs.writeFile(fileUri, final)
// }

// async function refreshSearchResult(
//   id: number,
//   fileUri: Uri,
//   query: SearchQuery,
// ) {
//   // const command = buildCommand(query)
//   // const bytes = await workspace.fs.readFile(fileUri)
//   // const { receiveResult, conclude } = bufferMaker(bytes)
//   // const updatedResults: DisplayResult[] = []
//   // await streamedPromise(command!, (results: SgSearch[]) => {
//   //   for (const r of results) {
//   //     receiveResult(r.replacement!, r.range.byteOffset)
//   //     updatedResults.push(splitByHighLightToken(r))
//   //   }
//   // })
//   // const final = conclude()
//   // const replaced = new TextDecoder('utf-8').decode(final)
//   // previewContents.set(fileUri.path, replaced)
//   // previewProvider.notifyDiffChange(fileUri)
//   // parentPort.postMessage('refreshSearchResult', {
//   //   id,
//   //   updatedResults,
//   //   fileName: query.includeFile,
//   // })
// }

/**
 *  set up replace preview and open file
 **/
export function activatePreview({ subscriptions }: ExtensionContext) {
  subscriptions.push(
    workspace.registerTextDocumentContentProvider(SCHEME, previewProvider),
    workspace.onDidCloseTextDocument(cleanupDocument),
  )
}
