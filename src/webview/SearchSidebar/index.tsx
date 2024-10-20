import SearchResultList from './SearchResultList'
import SearchWidgetContainer from './SearchWidgetContainer'
import LoadingBar from './LoadingBar'
import SearchProviderMessage from './SearchProviderMessage'

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
