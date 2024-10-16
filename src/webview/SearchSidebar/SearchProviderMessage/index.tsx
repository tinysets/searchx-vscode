import { memo } from 'react'
import type { DisplayResult } from '../../../types.js'

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

interface SearchProviderMessageProps {
  results: [string, DisplayResult[]][]
}

const SearchProviderMessage = memo(
  ({ results }: SearchProviderMessageProps) => {
    const resultCount = results.reduce((a, l) => a + l[1].length, 0)
    const fileCount = results.length
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
  },
)

export default SearchProviderMessage
