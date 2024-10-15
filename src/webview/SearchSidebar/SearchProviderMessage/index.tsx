import { memo } from 'react'
import { VSCodeLink } from '@vscode/webview-ui-toolkit/react'
import type { DisplayResult } from '../../../types.js'

const style = {
  color: 'var(--vscode-search-resultsInfoForeground)',
  padding: '0 22px 8px',
  lineHeight: '1.4em',
}

const codeStyle = {
  fontSize: 'var(--vscode-font-size)',
} as const

function Empty() {
  return (
    <div style={style}>
    </div>
  )
}

interface SearchProviderMessageProps {
  results: [string, DisplayResult[]][]
  error: Error | null
}

const SearchProviderMessage = memo(
  ({ results, error }: SearchProviderMessageProps) => {
    if (error) {
      return (
        <div style={style}>
          Error occurs when running <code style={codeStyle}>ast-grep</code>.
          <br />
          Make sure you{' '}
          <VSCodeLink href="https://ast-grep.github.io/guide/quick-start.html#installation">
            installed the binary
          </VSCodeLink>{' '}
          and the command <code style={codeStyle}>ast-grep</code> is accessible{' '}
          <VSCodeLink href="https://github.com/ast-grep/ast-grep-vscode/issues/133#issuecomment-1943153446">
            by your editor
          </VSCodeLink>
          .
        </div>
      )
    }
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
