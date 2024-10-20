import SearchResultList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'
import { useSearchResult } from '../hooks/useSearch'
import LoadingBar from './LoadingBar'
import SearchProviderMessage from './SearchProviderMessage'
import { useDeferredValue } from 'react'

export const SearchSidebar = () => {

  return (
    <>
      <LoadingBar />
      <SearchWidgetContainer />
      <SearchProviderMessage />
      <SearchResultList />
    </>
  )
}
