import path from 'node:path'
import * as vscode from 'vscode';
import { workspace } from 'vscode'
import { type SearchQuery, type DisplayResult, type RangeInfo } from '../common/types'
import { QueryArgs, QueryResult, QueryResultFullSearch } from '../common/interfaces'

//=========== search QueryArgs ============

// let testSGSearch = {
//   "text": "getNonce()",
//   "range": {
//     "byteOffset": { "start": 5627, "end": 5637 },
//     "start": { "line": 184, "column": 16 },
//     "end": { "line": 184, "column": 26 }
//   },
//   "file": "src\\extension.ts",
//   "lines": "\t\tconst nonce = getNonce();\r",
//   "language": "TypeScript"
// }


// const dataDir = './data';
// const clientDir = 'E:\\wp\\THS\\Branches\\SBT\\Client\\Assets\\';
// const netbookDir = 'C:\\Users\\lihang.zhao\\Desktop\\GoogleDriver\\workdoc';

// let ignoreList = [
//   '**/node_modules',
//   '**/.git',
//   '.gitignore',
//   '.vscode',
//   'Library',
//   'Logs',
//   'Temp',
//   'obj',
//   '**/LICENSE.txt',
//   '**/readme.txt',
//   '**/*vcxproj*.txt',
//   '**/*.pdf',
// ];

// let includeList: string[] = [
//   // '**/*.js',
//   '**/*.ts',
//   '**/*.txt',
//   '**/*.cs',
//   '**/*.json',
// ];

function getFilesExclude() {
  let ignoreList: string[] = [];
  const filesConfig = vscode.workspace.getConfiguration('files');
  const filesExclude = filesConfig.get<{ [key: string]: boolean }>('exclude');
  const searchConfig = vscode.workspace.getConfiguration('search');
  // const useIgnoreFiles = searchConfig.get<boolean>('useIgnoreFiles');
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

function splitByComma(str: string | undefined): string[] {
  if (!str) {
    return [];
  }
  str = str.replace(/(\r\n|\r)/g, '\n');
  let strs = str.split('\n').map((v) => v.split(',')).flat().map(v => v.trim()).filter((v) => v);
  return strs;
}

function getQueryWindowSize(str: string | undefined | number) {
  if (typeof str === 'number') {
    return str;
  }
  if (!str) {
    return 1;
  }
  try {
    let num = parseInt(str);
    if (num == Number.NaN) {
      num = 1;
    }
    if (num <= 0) {
      num = 1;
    }
    return num;
  } catch (e) {
    return 1;
  }
}


export function buildQueryArgs(query: SearchQuery): QueryArgs | null {
  if (!query.pattern) {
    return null;
  }
  const uris = workspace.workspaceFolders?.map(i => i.uri?.fsPath) ?? []
  let dir = uris[0]
  if (!dir) {
    return null;
  }

  let ignoreList = getFilesExclude()
  ignoreList.push(...splitByComma(query.excludeFile));
  let includeList: string[] = []
  includeList.push(...splitByComma(query.includeFile));
  let fzfList: string[] = []
  fzfList.push(...splitByComma(query.fzfFile));
  let windowSize = getQueryWindowSize(query.windowSize);

  let queryArgs: QueryArgs = {
    dir: dir,
    ignoreList: ignoreList,
    includeList: includeList,
    fzfList: fzfList,
    caseSensitive: !!query.caseSensitive,
    search: query.pattern,
    forward: !!query.forward,
    windowSize: windowSize,
    fullSearch: !!query.fullSearch
  }
  return queryArgs;
}


//=========== search Results ============

const LEADING_SPACES_RE = /^\s*/
const PRE_CTX = 30
const POST_CTX = 100

const MOD = 1e9 + 7
let G_UID = 0

function getFileExt(filePath: string) {
  const { ext } = path.parse(filePath);
  if (ext && ext.length > 1 && ext[0] === '.') {
    return ext.slice(1);
  }
  return ext;
}

type SearchResult = {
  text: string
  range: RangeInfo
  fileAbsPath: string
  filePath: string
  lineText: string
  language: string
}
export function buildDisplayResult(searchQuery: SearchQuery, result: QueryResult | QueryResultFullSearch): DisplayResult {

  let searchResult = {} as SearchResult;
  if (result.fullSearch) {
    let queryResult = result as QueryResultFullSearch
    searchResult.text = searchQuery.pattern;
    searchResult.fileAbsPath = queryResult.fileAbsPath;
    searchResult.filePath = queryResult.filePath;
    searchResult.language = getFileExt(queryResult.filePath)
    searchResult.lineText = queryResult.startLineText;
    searchResult.range = {
      byteOffset: { start: queryResult.posStart, end: queryResult.posEnd },
      start: { line: queryResult.lineStart, column: queryResult.posStartAtLine },
      end: { line: queryResult.lineEnd, column: queryResult.posEndAtLine }
    };
  } else {
    let queryResult = result as QueryResult
    if (queryResult.shots.length == 0)
      return null as any;

    let startShot = queryResult.shots[0]
    let endShot = queryResult.shots.at(-1)!

    searchResult.text = searchQuery.pattern;
    searchResult.fileAbsPath = queryResult.fileAbsPath;
    searchResult.filePath = queryResult.filePath;
    searchResult.language = getFileExt(queryResult.filePath)
    searchResult.lineText = queryResult.lines[startShot.line];
    searchResult.range = {
      byteOffset: { start: queryResult.posStart, end: queryResult.posEnd },
      start: { line: startShot.line, column: startShot.pos },
      end: { line: endShot.line, column: endShot.end }
    };
  }

  const { start, end } = searchResult.range
  let startCol = start.column
  let endCol = end.column
  let displayLine = searchResult.lineText
  // multiline matches! only display the first line!
  if (start.line < end.line) {
    displayLine = searchResult.lineText.split(/\r?\n/, 1)[0]
    endCol = displayLine.length
  }
  // strip leading spaces
  const leadingSpaces = displayLine.match(LEADING_SPACES_RE)?.[0].length
  if (leadingSpaces) {
    displayLine = displayLine.substring(leadingSpaces)
    startCol -= leadingSpaces
    endCol -= leadingSpaces
  }
  // TODO: improve this rendering logic
  // truncate long lines
  if (startCol > PRE_CTX + 3) {
    displayLine = '...' + displayLine.substring(startCol - PRE_CTX)
    const length = endCol - startCol
    startCol = PRE_CTX + 3
    endCol = startCol + length
  }
  if (endCol + POST_CTX + 3 < displayLine.length) {
    displayLine = displayLine.substring(0, endCol + POST_CTX) + '...'
  }

  G_UID = (G_UID + 1) % MOD
  let displayResult: DisplayResult = {
    uid: G_UID++,
    startCol,
    endCol,
    displayLine,
    lineSpan: end.line - start.line,
    fileAbsPath: searchResult.fileAbsPath,
    filePath: searchResult.filePath,
    range: searchResult.range,
    language: searchResult.language,
  };
  return displayResult;
}