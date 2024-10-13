import { useEffect, useState } from 'react'
import { useLocalStorage, useDebounce, useBoolean } from 'react-use'
import { MessageType, SearchQuery } from '../../types.js'
import { childPort } from '../postMessage'
export { SearchQuery }
// this is the single sole point of communication
// between search query and search result
import { postSearch } from './useSearch'

const searchQuery: Record<keyof SearchQuery, string> = {
  pattern: '',
  strictness: 'smart',
  selector: '',
  includeFile: '',
  excludeFile: '',
  rewrite: '',
  lang: '',
  caseSensitive: '',
  fullSearch: '',
  forward: 'true',
  fzfFile: '',
  windowSize: '1',
}

type PatternKeys = 'selector'

const LS_KEYS: Record<Exclude<keyof SearchQuery, PatternKeys>, string> = {
  pattern: 'searchx-search-panel-input-value',
  includeFile: 'searchx-search-panel-include-value',
  excludeFile: 'searchx-search-panel-exclude-value',
  rewrite: 'searchx-search-panel-rewrite-value',
  strictness: 'searchx-search-panel-strictness-value',
  lang: 'searchx-search-panel-lang-value',
  caseSensitive: 'searchx-search-panel-caseSensitive-value',
  fullSearch: 'searchx-search-panel-fullSearch-value',
  forward: 'searchx-search-panel-forward-value',
  fzfFile: 'searchx-search-panel-fileFzf-value',
  windowSize: 'searchx-search-panel-windowSize-value',
}

export function refreshResult() {
  postSearch(searchQuery)
}
childPort.onMessage(MessageType.RefreshAllSearch, refreshResult)
childPort.onMessage(MessageType.ClearSearchResults, () => {
  searchQuery.pattern = ''
  refreshResult()
})

export function useSearchField(key: keyof typeof LS_KEYS) {
  const [field = '', setField] = useLocalStorage(LS_KEYS[key], '')
  // this useEffect and useDebounce is silly
  useEffect(() => {
    searchQuery[key] = field
  }, [field, key])
  useDebounce(refreshResult, 150, [field])
  return [field, setField] as const
}

export function usePatternConfig(key: PatternKeys) {
  const [field, setField] = useState(searchQuery[key])
  // this useEffect and useDebounce is silly
  useEffect(() => {
    searchQuery[key] = field
  }, [field, key])
  useDebounce(refreshResult, 150, [field])
  return [field, setField] as const
}

export function useSearchOption() {
  const [includeFile = '', setIncludeFile] = useSearchField('includeFile')
  const [excludeFile = '', setExcludeFile] = useSearchField('excludeFile')
  const [fzfFile = '', setFzfFile] = useSearchField('fzfFile')
  const [showOptions, toggleOptions] = useBoolean(Boolean(includeFile || excludeFile || fzfFile))

  useEffect(() => {
    childPort.onMessage(MessageType.SetIncludeFile, val => {
      setIncludeFile(val.includeFile)
      toggleOptions(true)
    })
  }, [toggleOptions, setIncludeFile, setExcludeFile, setFzfFile])
  return {
    includeFile,
    setIncludeFile,
    showOptions,
    toggleOptions,
    excludeFile,
    setExcludeFile,
    fzfFile,
    setFzfFile,
  }
}

export function hasInitialRewrite() {
  return Boolean(localStorage.getItem(LS_KEYS.rewrite))
}
