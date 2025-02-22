import { DisplayFileResult, DisplayResult, MessageType, OpenFileResult, SearchQuery, type ChildPort, type ChildToParent } from '../common/types'
import { Unport } from 'unport'
import { searchOptions, searchOptionsToSave, setSearching, vueStore } from './store'
import { watch } from 'vue'
import { scrollToIndex } from './SearchSidebar/SearchResultList/hooks'
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

const openFile = (data: OpenFileResult) => {
  childPort.postMessage(MessageType.C2S_OpenFile, data)
}

childPort.onMessage(MessageType.S2C_ToggleAllSearch, () => {
  vueStore.expandedGlobal = !vueStore.expandedGlobal
  for (const element of vueStore.grouped) {
    element.expanded = vueStore.expandedGlobal
  }
})

let hasStaleResult = false
function refreshResultIfStale() {
  if (hasStaleResult) {
    // empty previous result
    scrollToIndex(0)
    hasStaleResult = false
    vueStore.grouped = []
    vueStore.activeItem = null
    vueStore.expandedGlobal = true
  }
}

const MOD = 1e9 + 7
let id = 0

function postSearch(searchQuery: SearchQuery) {
  id = (id + 1) % MOD
  hasStaleResult = true
  childPort.postMessage(MessageType.C2S_Search, { id, ...searchQuery })
  setSearching(true)
}

export function openAction(match: DisplayResult) {
  let groups = vueStore.grouped;
  let fileResult = groups.find(g => g.fileAbsPath === match.fileAbsPath)!;
  if (!fileResult)
    return;
  let matchIndex = fileResult.results.indexOf(match)

  fileResult = JSON.parse(JSON.stringify(fileResult)) // deep clone, payload contains Proxy object!
  openFile({ fileResult, matchIndex })
}


function byFilePath(a: DisplayFileResult, b: DisplayFileResult) {
  return a.filePath.localeCompare(b.filePath)
}

function groupBy(matches: DisplayResult[]) {
  const groups = new Map<string, DisplayFileResult>()
  for (const match of matches) {
    if (!groups.has(match.fileAbsPath)) {
      groups.set(match.fileAbsPath, {
        fileAbsPath: match.fileAbsPath,
        filePath: match.filePath,
        language: match.language,
        expanded: vueStore.expandGlobal,
        results: []
      })
    }
    groups.get(match.fileAbsPath)!.results.push(match)
  }
  return groups
}

function merge(newEntries: Map<string, DisplayFileResult>) {
  // first, clone the old map for react
  const temp = new Map<string, DisplayFileResult>()
  for (const element of vueStore.grouped) {
    temp.set(element.fileAbsPath, element)
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

childPort.onMessage(MessageType.S2C_SearchResultStreaming, event => {
  const { id: eventId } = event
  if (eventId !== id) {
    return
  }
  refreshResultIfStale()
  vueStore.grouped = merge(groupBy(event.displayResults))
  vueStore.grouped.sort(byFilePath)

  const resultCount = vueStore.grouped.reduce((a, l) => a + l.results.length, 0)
  if (resultCount > 10000) { // 结果超过 10000 也没什么意义了, 主要是界面变卡了 先不想着优化性能
    stopSearch()
  }
})
function stopSearch() {
  vueStore.searching = false
  id++
  childPort.postMessage(MessageType.C2S_StopSearch, {})
}

childPort.onMessage(MessageType.S2C_SearchEnd, event => {
  const { id: eventId } = event
  if (eventId !== id) {
    return
  }
  refreshResultIfStale()
  setSearching(false)
})

childPort.onMessage(MessageType.S2C_Error, event => {
  if (event.id !== id) {
    return
  }
  refreshResultIfStale()
  setSearching(false)
  vueStore.grouped = []
})


export function dismissOneMatch(match: DisplayResult) {

  for (const group of vueStore.grouped) {
    if (group.fileAbsPath !== match.fileAbsPath) {
      continue
    }
    group.results = group.results.filter(m => m !== match)
    if (group.results.length === 0) {
      dismissOneFile(group.fileAbsPath) // remove files if user deleted all matches
    }
    childPort.postMessage(MessageType.C2S_DismissOneMatch, { fileAbsPath: match.fileAbsPath, uid: match.uid })
    break
  }
}

export function dismissOneFile(fileAbsPath: string) {
  let index = vueStore.grouped.findIndex(g => g.fileAbsPath === fileAbsPath)
  if (index != -1) {
    let item = vueStore.grouped[index]
    if (!item.inView) {
      scrollToIndex(index)
    }
    vueStore.grouped = vueStore.grouped.filter(g => g.fileAbsPath !== fileAbsPath)
    childPort.postMessage(MessageType.C2S_DismissOneFile, { fileAbsPath })
  }
}

// SearchQuery
export function initQueryChangedListener() {
  watch(() => {
    for (const key of searchOptions) {
      (vueStore as any)[key];
    }
  }, () => {
    refreshSearch()
  }, { deep: true, flush: 'post', immediate: true, once: false })
}

const getSearchQuery = () => {
  let searchQuery = {} as any;
  for (const key of searchOptions) {
    searchQuery[key] = (vueStore as any)[key];
  }
  return searchQuery;
}
export function refreshSearch() {
  let searchQuery = getSearchQuery();
  postSearch(searchQuery)
}

childPort.onMessage(MessageType.S2C_RefreshAllSearch, refreshSearch)
childPort.onMessage(MessageType.S2C_ClearSearchResults, () => {
  vueStore.pattern = ''
})

childPort.onMessage(MessageType.S2C_SetIncludeFile, val => {
  vueStore.includeFile = val.includeFile
  vueStore.showOptions = true
})

export function initSearchOptionsChangedListener() {
  const getSearchOptions = () => {
    let options = {} as any;
    for (const key of searchOptionsToSave) {
      options[key] = (vueStore as any)[key];
    }
    return options;
  }

  watch(() => {
    for (const key of searchOptionsToSave) {
      (vueStore as any)[key];
    }
  }, () => {
    let searchOptions = getSearchOptions();
    childPort.postMessage(MessageType.C2S_SaveSearchOptions, searchOptions)
  }, { deep: true, flush: 'post', once: false })

  childPort.onMessage(MessageType.S2C_LoadSavedSearchOptions, obj => {
    for (const key in obj) {
      (vueStore as any)[key] = obj[key]
    }
  })
}
