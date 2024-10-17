import { MessageType } from '../../types.js'
import { childPort } from '../messageHub.js'
// this is the single sole point of communication
// between search query and search result
import { postSearch } from './useSearch'
import { includeFileAtom, searchOptions, patternAtom, showOptionsAtom, store } from '../store.js'
import { Atom } from 'jotai'


export function initQueryChangedListeners() {
  for (const key in searchOptions) {
    const element: Atom<unknown> = searchOptions[key];
    store.sub(element, () => {
      refreshSearch()
    })
  }
}

export function refreshSearch() {
  let searchQuery = getSearchQuery();
  postSearch(searchQuery)
}

const getSearchQuery = () => {
  let searchQuery = {} as any;
  for (const key in searchOptions) {
    const element: Atom<unknown> = searchOptions[key];
    let value = store.get(element)
    searchQuery[key] = value;
  }
  return searchQuery;
}


childPort.onMessage(MessageType.RefreshAllSearch, refreshSearch)
childPort.onMessage(MessageType.ClearSearchResults, () => {
  store.set(patternAtom, '')
})

childPort.onMessage(MessageType.SetIncludeFile, val => {
  store.set(includeFileAtom, val.includeFile)
  store.set(showOptionsAtom, true)
})
