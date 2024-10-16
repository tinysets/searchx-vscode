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
  file: string
  startIdx: number
  endIdx: number
  displayLine: string
  lineSpan: number
  range: RangeInfo
  language: string
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

export type SgSearch = {
  text: string
  range: RangeInfo
  file: string
  lines: string
  language: string
}

export interface ParentToChild {
  searchResultStreaming: {
    searchResult: DisplayResult[]
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
}

export interface ChildToParent {
  search: WithId<SearchQuery>
  openFile: {
    filePath: string
    locationsToSelect: {
      start: Position
      end: Position
    }
  }
}

export type Definition = {
  parent2child: ParentToChild
  child2parent: ChildToParent
}

export type ChildPort = Unport<Definition, 'child'>
export type ParentPort = Unport<Definition, 'parent'>


export enum MessageType {
  Search = 'search',
  OpenFile = 'openFile',
  SearchEnd = 'searchEnd',
  Error = 'error',
  SetIncludeFile = 'setIncludeFile',
  RefreshAllSearch = 'refreshAllSearch',
  ClearSearchResults = 'clearSearchResults',
  ToggleAllSearch = 'toggleAllSearch',
  SearchResultStreaming = 'searchResultStreaming',
}