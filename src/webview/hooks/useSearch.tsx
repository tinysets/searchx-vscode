import {
  type DisplayResult,
  type OpenPayload,
  openFile,
  childPort,
} from '../postMessage'
import { useSyncExternalStore } from 'react'
import { MessageType, SearchQuery } from '../../types.js'
import { setSearching } from '../store'

// id should not overflow, the MOD is large enough
// for most cases (unless there is buggy search)
const MOD = 1e9 + 7

// maintain the latest search task id and callback
let id = 0
let grouped: [string, DisplayResult[]][] = []

// we will not immediately drop previous result
// instead, use a stale flag and update it on streaming or end
// TODO: refactor this state
let hasStaleResult = false
const resultChangeCallbacks: Set<() => void> = new Set()

function refreshResultIfStale() {
  if (hasStaleResult) {
    // empty previous result
    hasStaleResult = false
    grouped = []
    for (const f of resultChangeCallbacks) {
      f()
    }
  }
}
export function onResultChange(f: () => void) {
  resultChangeCallbacks.add(f)
  return () => {
    resultChangeCallbacks.delete(f)
  }
}

function byFilePath(a: [string, unknown], b: [string, unknown]) {
  return a[0].localeCompare(b[0])
}

// this function is also called in useQuery
function postSearch(searchQuery: SearchQuery) {
  id = (id + 1) % MOD
  childPort.postMessage(MessageType.Search, { id, ...searchQuery })
  setSearching(true)
  hasStaleResult = true
  notify()
}

export { postSearch }


childPort.onMessage(MessageType.SearchResultStreaming, event => {
  const { id: eventId } = event
  if (eventId !== id) {
    return
  }
  refreshResultIfStale()
  grouped = merge(groupBy(event.searchResult))
  grouped.sort(byFilePath)
  notify()
})

childPort.onMessage(MessageType.SearchEnd, event => {
  const { id: eventId } = event
  if (eventId !== id) {
    return
  }
  setSearching(false)
  refreshResultIfStale()
  notify()
})

childPort.onMessage(MessageType.Error, event => {
  if (event.id !== id) {
    return
  }
  setSearching(false)
  grouped = []
  notify()
})

function groupBy(matches: DisplayResult[]) {
  const groups = new Map<string, DisplayResult[]>()
  for (const match of matches) {
    if (!groups.has(match.file)) {
      groups.set(match.file, [])
    }
    groups.get(match.file)!.push(match)
  }
  return groups
}

function merge(newEntries: Map<string, DisplayResult[]>) {
  // first, clone the old map for react
  const temp = new Map(grouped)
  for (const [file, newList] of newEntries) {
    const existing = temp.get(file) || []
    temp.set(file, existing.concat(newList))
  }
  return [...temp.entries()]
}

// version is for react to update view
let version = 114514
const watchers: Set<() => void> = new Set()
function notify() {
  // snapshot should precede onChange
  version = (version + 1) % MOD
  for (const watcher of watchers) {
    watcher()
  }
}

function subscribe(onChange: () => void): () => void {
  watchers.add(onChange)
  return () => {
    watchers.delete(onChange)
  }
}

function getSnapshot() {
  return version // symbolic snapshot for react
}

/**
 * Either open a file or preview the diff
 */
export function openAction(payload: OpenPayload) {
  openFile(payload)
}

export const useSearchResult = () => {
  useSyncExternalStore(subscribe, getSnapshot)
  return {
    groupedByFileSearchResult: grouped,
  }
}


export function dismissOneMatch(match: DisplayResult) {
  for (const group of grouped) {
    if (group[0] !== match.file) {
      continue
    }
    group[1] = group[1].filter(m => m !== match)
    break
  }
  // remove files if user deleted all matches
  grouped = grouped.filter(g => g[1].length > 0)
  notify()
}
export function dismissOneFile(filePath: string) {
  grouped = grouped.filter(g => g[0] !== filePath)
  notify()
}

export function findIndex(filePath: string) {
  return grouped.findIndex(g => g[0] === filePath)
}
