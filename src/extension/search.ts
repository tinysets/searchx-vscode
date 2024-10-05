import path from 'node:path'
import { type ExtensionContext, commands, workspace, window } from 'vscode'
import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'

import { parentPort } from './common'
import { type SgSearch, type DisplayResult, type SearchQuery, MessageType } from '../types.js'

/**
 * Set up search query handling and search commands
 */
export function activateSearch(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('ast-grep.searchInFolder', findInFolder),
  )
}

// biome-ignore lint/suspicious/noExplicitAny: todo
function findInFolder(data: any) {
  const workspacePath = workspace.workspaceFolders?.[0]?.uri?.fsPath
  // compute relative path to the workspace folder
  const relative = workspacePath && path.relative(workspacePath, data.fsPath)
  if (!relative) {
    window.showErrorMessage('ast-grep Error: folder is not in the workspace')
    return
  }
  commands.executeCommand('ast-grep.search.input.focus')
  parentPort.postMessage(MessageType.SetIncludeFile, {
    includeFile: relative,
  })
}

const LEADING_SPACES_RE = /^\s*/
const PRE_CTX = 30
const POST_CTX = 100

export function splitByHighLightToken(search: SgSearch): DisplayResult {
  const { start, end } = search.range
  let startIdx = start.column
  let endIdx = end.column
  let displayLine = search.lines
  // multiline matches! only display the first line!
  if (start.line < end.line) {
    displayLine = search.lines.split(/\r?\n/, 1)[0]
    endIdx = displayLine.length
  }
  // strip leading spaces
  const leadingSpaces = displayLine.match(LEADING_SPACES_RE)?.[0].length
  if (leadingSpaces) {
    displayLine = displayLine.substring(leadingSpaces)
    startIdx -= leadingSpaces
    endIdx -= leadingSpaces
  }
  // TODO: improve this rendering logic
  // truncate long lines
  if (startIdx > PRE_CTX + 3) {
    displayLine = '...' + displayLine.substring(startIdx - PRE_CTX)
    const length = endIdx - startIdx
    startIdx = PRE_CTX + 3
    endIdx = startIdx + length
  }
  if (endIdx + POST_CTX + 3 < displayLine.length) {
    displayLine = displayLine.substring(0, endIdx + POST_CTX) + '...'
  }
  return {
    startIdx,
    endIdx,
    displayLine,
    lineSpan: end.line - start.line,
    file: search.file,
    range: search.range,
    language: search.language,
    ...handleReplacement(search.replacement),
  }
}

function handleReplacement(replacement?: string) {
  if (replacement) {
    return { replacement }
  }
  return {}
}


parentPort.onMessage(MessageType.Search, async payload => {
  const onData = (ret: SgSearch[]) => {
    parentPort.postMessage(MessageType.SearchResultStreaming, {
      ...payload,
      searchResult: ret.map(splitByHighLightToken),
    })
  }

  parentPort.postMessage(MessageType.SearchEnd, payload)
})
