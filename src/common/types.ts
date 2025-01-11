import type { Unport } from 'unport'

export type WithId<T> = T & { id: number }

export type Position = {
  line: number
  column: number
}

export interface RangeInfo {
  byteOffset: {
    start: number
    end: number
  }
  start: Position
  end: Position
}

export interface DisplayResult {
  fileAbsPath: string
  filePath: string
  startCol: number
  endCol: number
  displayLine: string
  lineSpan: number
  range: RangeInfo
  language: string
}

export interface DisplayFileResult {
  fileAbsPath: string
  filePath: string
  expanded: boolean
  language: string
  results: DisplayResult[]
  inView?: boolean
}

export interface OpenFileResult {
  fileResult: DisplayFileResult
  matchIndex: number
}

export interface SearchQuery {
  pattern: string
  includeFile: string
  excludeFile: string
  caseSensitive: boolean
  fullSearch: boolean
  forward: boolean
  fzfFile: string
  windowSize: number
}

export interface ParentToChild {
  searchResultStreaming: {
    displayResult: DisplayResult[]
    id: number
  } & SearchQuery
  searchEnd: WithId<SearchQuery>
  error: {
    id: number
    error: Error
  }
  setIncludeFile: {
    includeFile: string
  }
  refreshSearchResult: {
    id: number
    updatedResults: DisplayResult[]
    fileName: string
  }
  refreshAllSearch: unknown
  clearSearchResults: unknown
  toggleAllSearch: unknown
  loadSavedSearchOptions: any
}

export interface ChildToParent {
  search: WithId<SearchQuery>
  openFile: any
  saveSearchOptions: any
  webViewInited: any
  stopSearch: any
}

export type Definition = {
  parent2child: ParentToChild
  child2parent: ChildToParent
}

export type ChildPort = Unport<Definition, 'child'>
export type ParentPort = Unport<Definition, 'parent'>


export enum MessageType {
  C2S_Search = 'search',
  C2S_OpenFile = 'openFile',
  S2C_SearchEnd = 'searchEnd',
  S2C_Error = 'error',
  S2C_SetIncludeFile = 'setIncludeFile',
  S2C_RefreshAllSearch = 'refreshAllSearch',
  S2C_ClearSearchResults = 'clearSearchResults',
  S2C_ToggleAllSearch = 'toggleAllSearch',
  S2C_SearchResultStreaming = 'searchResultStreaming',
  C2S_SaveSearchOptions = 'saveSearchOptions',
  S2C_LoadSavedSearchOptions = 'loadSavedSearchOptions',
  C2S_WebViewInited = 'webViewInited',
  C2S_StopSearch = 'stopSearch',
}

export enum LocalSavedType {
  SavedSearchOptions = "searchx-SavedSearchOptions",
}
