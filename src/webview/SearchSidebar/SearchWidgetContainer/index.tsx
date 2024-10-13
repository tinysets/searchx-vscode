import { memo } from 'react'
import SearchOptions from './SearchOptions'
import SearchWidget from './SearchWidget'
import WindowSizeConfig from './WindowSizeConfig'

function SearchWidgetContainer() {
  return (
    <div style={{ margin: '0 12px 0 2px' }}>
      <SearchWidget />
      <WindowSizeConfig />
      <SearchOptions />
    </div>
  )
}

export default memo(SearchWidgetContainer)
