import SearchResultList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'
import { UseDarkContextProvider } from '../hooks/useDark'
import { useSearchResult } from '../hooks/useSearch'
import LoadingBar from '../LoadingBar'
import SearchProviderMessage from './SearchProviderMessage'
import { useDeferredValue } from 'react'
import { searchingAtom } from '../store'
import { useAtom } from 'jotai'

export const SearchSidebar = () => {

  const [searching] = useAtom(searchingAtom)

  const { groupedByFileSearchResult } = useSearchResult()

  // rendering tree is too expensive, useDeferredValue
  const groupedByFileSearchResultForRender = useDeferredValue(
    groupedByFileSearchResult,
  )

  return (
    <UseDarkContextProvider>
      <LoadingBar loading={searching} />
      <SearchWidgetContainer />
      <SearchProviderMessage
        error={null}
        results={groupedByFileSearchResult}
      />
      <SearchResultList matches={groupedByFileSearchResultForRender} />
    </UseDarkContextProvider>
  )
}
