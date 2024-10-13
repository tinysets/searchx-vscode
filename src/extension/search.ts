import path from 'node:path'
import * as vscode from 'vscode';
import { type ExtensionContext, commands, workspace, window } from 'vscode'
import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'

import { parentPort, resolveBinary, streamedPromise } from './common.js'
import { type SgSearch, type DisplayResult, type SearchQuery, MessageType } from '../types.js'
import { QueryArgs, QueryResult, QueryResultFullSearch } from '../interfaces.js'
import { Base64 } from './base64.js'

/**
 * Set up search query handling and search commands
 */
export function activateSearch(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('searchx.searchInFolder', findInFolder),
  )
}

// biome-ignore lint/suspicious/noExplicitAny: todo
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

const LEADING_SPACES_RE = /^\s*/
const PRE_CTX = 30
const POST_CTX = 100


let testSGSearch = {
  "text": "getNonce()",
  "range": {
    "byteOffset": { "start": 5627, "end": 5637 },
    "start": { "line": 184, "column": 16 },
    "end": { "line": 184, "column": 26 }
  },
  "file": "src\\extension.ts",
  "lines": "\t\tconst nonce = getNonce();\r",
  "language": "TypeScript"
}

function getFileExtension(filePath: string) {
  const { ext } = path.parse(filePath);
  if (ext && ext.length > 1 && ext[0] === '.') {
    return ext.slice(1);
  }
  return ext;
}

export function splitByHighLightToken(searchQuery: SearchQuery, result: QueryResult | QueryResultFullSearch): DisplayResult {

  let search: SgSearch = {} as SgSearch;
  if (result.fullSearch) {
    let queryResult = result as QueryResultFullSearch
    search.text = searchQuery.pattern;
    search.file = queryResult.filePath;
    search.language = getFileExtension(queryResult.filePath)
    search.lines = queryResult.startLineText;
    search.range = {
      byteOffset: { start: queryResult.posStart, end: queryResult.posEnd },
      start: { line: queryResult.lineStart, column: queryResult.posStartAtLine },
      end: { line: queryResult.lineEnd, column: queryResult.posEndAtLine }
    };
  } else {
    let queryResult = result as QueryResult
    if (queryResult.shots.length == 0)
      return null as any;

    let startShot = queryResult.shots[0]
    let endShot = queryResult.shots[queryResult.shots.length - 1]

    search.text = searchQuery.pattern;
    search.file = queryResult.filePath;
    search.language = getFileExtension(queryResult.filePath)
    search.lines = queryResult.lines[startShot.line];
    search.range = {
      byteOffset: { start: queryResult.posStart, end: queryResult.posEnd },
      start: { line: startShot.line, column: startShot.pos },
      end: { line: endShot.line, column: endShot.end }
    };
  }

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


type StreamingHandler = (r: QueryResult[]) => void
let child: ChildProcessWithoutNullStreams | undefined

async function uniqueCommand(
  proc: ChildProcessWithoutNullStreams | undefined,
  handler: StreamingHandler,
) {
  // kill previous search
  if (child) {
    child.kill('SIGTERM')
  }
  if (!proc) {
    return Promise.resolve()
  }
  try {
    // set current proc to child
    child = proc
    await streamedPromise(proc, handler)
    // unset child only when the promise succeed
    // interrupted proc will be replaced by latter proc
    child = undefined
  } catch (e) {
    console.info('search aborted: ', e)
  }
}

// TODO: add unit test for commandBuilder
export function buildCommand(query: QueryArgs) {
  const command = resolveBinary()
  let base64 = Base64.jsonToBase64(query)
  console.log(base64)
  const args = ['--base64', base64]
  return spawn(command, args, {
    cwd: query.dir,
    shell: process.platform === 'win32', // it is safe because it is end user input
  })
}
interface Handlers {
  onData: StreamingHandler
  onError: (e: Error) => void
}


const dataDir = './data';
const clientDir = 'E:\\wp\\THS\\Branches\\SBT\\Client\\Assets\\';
const netbookDir = 'C:\\Users\\lihang.zhao\\Desktop\\GoogleDriver\\workdoc';

let ignoreList = [
  '**/node_modules',
  '**/.git',
  '.gitignore',
  '.vscode',
  'Library',
  'Logs',
  'Temp',
  'obj',
  '**/LICENSE.txt',
  '**/readme.txt',
  '**/*vcxproj*.txt',
  '**/*.pdf',
];

let includeList: string[] = [
  // '**/*.js',
  '**/*.ts',
  '**/*.txt',
  '**/*.cs',
  '**/*.json',
];

function getFilesExclude() {
  let ignoreList: string[] = [];
  const filesConfig = vscode.workspace.getConfiguration('files');
  const filesExclude = filesConfig.get<{ [key: string]: boolean }>('exclude');
  const searchConfig = vscode.workspace.getConfiguration('search');
  const useIgnoreFiles = searchConfig.get<boolean>('useIgnoreFiles');
  const searchExclude = searchConfig.get<{ [key: string]: boolean }>('exclude');

  if (filesExclude) {
    for (const key in filesExclude) {
      if (filesExclude[key]) {
        ignoreList.push(key);
      }
    }
  }

  if (searchExclude) {
    for (const key in searchExclude) {
      if (searchExclude[key]) {
        ignoreList.push(key);
      }
    }
  }
  // console.log(JSON.stringify(ignoreList, null, 2));

  return ignoreList;
}

function getStringList(str: string | undefined) {
  if (!str) {
    return [];
  }
  str = str.replace(/(\r\n|\r)/g, '\n');
  let strs = str.split('\n').map((v) => v.split(',')).flat().map(v => v.trim()).filter((v) => v);
  return strs;
}

function getPatternRes(query: SearchQuery, handlers: Handlers) {
  if (!query.pattern) {
    return;
  }
  const uris = workspace.workspaceFolders?.map(i => i.uri?.fsPath) ?? []
  let dir = uris[0]
  if (!dir) {
    return;
  }

  let ignoreList = getFilesExclude()
  ignoreList.push(...getStringList(query.excludeFile));
  let includeList: string[] = []
  includeList.push(...getStringList(query.includeFile));
  let fzfList: string[] = []
  fzfList.push(...getStringList(query.fzfFile));

  let queryArgs: QueryArgs = {
    dir: dir,
    ignoreList: ignoreList,
    includeList: includeList,
    fzfList: fzfList,
    caseSensitive: query.caseSensitive == 'true',
    search: query.pattern,
    forward: query.forward == 'true',
    windowSize: 1,
    fullSearch: query.fullSearch == 'true'
  }

  const proc = buildCommand(queryArgs)
  if (proc) {
    proc.on('error', error => {
      console.debug('searchx CLI runs error')
      handlers.onError(error)
    })
  }
  return uniqueCommand(proc, handlers.onData)
}


parentPort.onMessage(MessageType.Search, async payload => {
  const onData = (ret: QueryResult[]) => {
    parentPort.postMessage(MessageType.SearchResultStreaming, {
      ...payload,
      searchResult: ret.map((v) => { return splitByHighLightToken(payload, v) }).filter((v) => v != null),
    })
  }

  await getPatternRes(payload, {
    onData,
    onError(error) {
      parentPort.postMessage(MessageType.Error, {
        error,
        ...payload,
      })
    },
  })

  parentPort.postMessage(MessageType.SearchEnd, payload)
})
