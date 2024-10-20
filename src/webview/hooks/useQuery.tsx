import { MessageType } from '../../types.js'
import { childPort } from '../messageHub.js'
// this is the single sole point of communication
// between search query and search result
import { postSearch } from './useSearch'
import { searchOptions, vueStore } from '../store.js'
import { watch } from 'vue'

export function initQueryChangedListeners() {
  watch(() => {
    for (const key of searchOptions) {
      (vueStore as any)[key];
    }
  }, () => {
    refreshSearch()
  }, { deep: true, flush: 'post', immediate: true, once: false })
}

export function refreshSearch() {
  let searchQuery = getSearchQuery();
  postSearch(searchQuery)
}

const getSearchQuery = () => {
  let searchQuery = {} as any;
  for (const key of searchOptions) {
    searchQuery[key] = (vueStore as any)[key];
  }
  return searchQuery;
}


childPort.onMessage(MessageType.RefreshAllSearch, refreshSearch)
childPort.onMessage(MessageType.ClearSearchResults, () => {
  vueStore.pattern = ''
})

childPort.onMessage(MessageType.SetIncludeFile, val => {
  vueStore.includeFile = val.includeFile
  vueStore.showOptions = true
})
