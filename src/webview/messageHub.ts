import { DisplayFileResult, DisplayResult, MessageType, SearchQuery, type ChildPort, type ChildToParent } from '../types.js'
import { Unport } from 'unport'
import { setSearching, vueStore } from './store.js'
export type OpenPayload = ChildToParent['openFile']

export const childPort: ChildPort = new Unport()

export function setupChildPort() {
  const vscode = acquireVsCodeApi()
  childPort.implementChannel({
    send(message) {
      vscode.postMessage(message)
    },
    accept(pipe) {
      window.addEventListener('message', ev => {
        pipe(ev.data)
      })
    },
  })
}

export const openFile = (data: OpenPayload) => {
  childPort.postMessage(MessageType.OpenFile, data)
}

childPort.onMessage(MessageType.ToggleAllSearch, () => {
  vueStore.expandedGlobal = !vueStore.expandedGlobal
  for (const element of vueStore.grouped) {
    element.expanded = vueStore.expandedGlobal
  }
})

let hasStaleResult = false
function refreshResultIfStale() {
  if (hasStaleResult) {
    // empty previous result
    hasStaleResult = false
    vueStore.grouped = []
  }
}

const MOD = 1e9 + 7
let id = 0

export function postSearch(searchQuery: SearchQuery) {
  id = (id + 1) % MOD
  hasStaleResult = true
  childPort.postMessage(MessageType.Search, { id, ...searchQuery })
  setSearching(true)
}


function byFilePath(a: DisplayFileResult, b: DisplayFileResult) {
  return a.file.localeCompare(b.file)
}

function groupBy(matches: DisplayResult[]) {
  const groups = new Map<string, DisplayFileResult>()
  for (const match of matches) {
    if (!groups.has(match.file)) {
      groups.set(match.file, { file: match.file, language: match.language, expanded: vueStore.expandGlobal, results: [], active: false })
    }
    groups.get(match.file)!.results.push(match)
  }
  return groups
}

function merge(newEntries: Map<string, DisplayFileResult>) {
  // first, clone the old map for react
  const temp = new Map<string, DisplayFileResult>()
  for (const element of vueStore.grouped) {
    temp.set(element.file, element)
  }

  for (const [file, resluts] of newEntries) {
    const existing = temp.get(file)
    if (existing) {
      existing.results = [...existing.results, ...resluts.results]
      continue
    }
    temp.set(file, resluts)
  }
  return [...temp.values()]
}

childPort.onMessage(MessageType.SearchResultStreaming, event => {
  const { id: eventId } = event
  if (eventId !== id) {
    return
  }
  refreshResultIfStale()
  vueStore.grouped = merge(groupBy(event.searchResult))
  vueStore.grouped.sort(byFilePath)
})

childPort.onMessage(MessageType.SearchEnd, event => {
  const { id: eventId } = event
  if (eventId !== id) {
    return
  }
  refreshResultIfStale()
  setSearching(false)
})

childPort.onMessage(MessageType.Error, event => {
  if (event.id !== id) {
    return
  }
  refreshResultIfStale()
  setSearching(false)
  vueStore.grouped = []
})


export function dismissOneMatch(match: DisplayResult) {

  for (const group of vueStore.grouped) {
    if (group.file !== match.file) {
      continue
    }
    group.results = group.results.filter(m => m !== match)
    break
  }
  // remove files if user deleted all matches
  vueStore.grouped = vueStore.grouped.filter(g => g.results.length > 0)
}

export function dismissOneFile(filePath: string) {
  vueStore.grouped = vueStore.grouped.filter(g => g.file !== filePath)
}