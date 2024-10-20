import { memo } from 'react'
import { useReactive } from 'react-vue-use-reactive'
import { vueStore } from '../../store.js'

const style = {
  color: 'var(--vscode-search-resultsInfoForeground)',
  padding: '0 22px 8px',
  lineHeight: '1.4em',
}

function Empty() {
  return (
    <div style={style}>
    </div>
  )
}



const SearchProviderMessage = memo(
  () => {
    return useReactive(() => {
      const resultCount = vueStore.grouped.reduce((a, l) => a + l.results.length, 0)
      const fileCount = vueStore.grouped.length
      return (
        <>
          {resultCount === 0 ? (
            <Empty />
          ) : (
            <div
              style={style}
            >{`${resultCount} results in ${fileCount} files`}</div>
          )}
        </>
      )
    })
  },
)

export default SearchProviderMessage
