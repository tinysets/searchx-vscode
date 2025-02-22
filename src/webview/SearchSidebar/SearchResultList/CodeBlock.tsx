import { memo } from 'react'
import type { DisplayResult } from '../../../common/types'
import * as stylex from '@stylexjs/stylex'
import { useReactive } from 'react-use-vue-reactive'
import { openAction } from '../../messageHub'

const styles = stylex.create({
  box: {
    flex: '1',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'pre',
    fontSize: '13px',
    lineHeight: '22px',
    height: '22px',
    cursor: 'pointer',
  },
  deleted: {
    textDecoration: 'line-through',
    backgroundColor: 'var(--vscode-diffEditor-removedTextBackground)',
    border: '1px solid var(--vscode-diffEditor-removedTextBackground)',
  },
  inserted: {
    backgroundColor: 'var(--vscode-diffEditor-insertedTextBackground)',
    ':not(:empty)': {
      border: '1px solid var(--vscode-diffEditor-insertedLineBackground)',
    },
  },
})

const style = {
  backgroundColor: 'var(--vscode-editor-findMatchHighlightBackground)',
  border: '1px solid var(--vscode-editor-findMatchHighlightBorder)',
}

// this is also hardcoded in vscode
const lineIndicatorStyle = {
  margin: '0 7px 4px',
  opacity: '0.7',
  fontSize: '0.9em',
  verticalAlign: 'bottom',
}

function MultiLineIndicator({ lineSpan }: { lineSpan: number }) {
  if (lineSpan <= 0) {
    return null
  }
  return <span style={lineIndicatorStyle}>+{lineSpan}</span>
}

function Highlight({
  displayLine,
  startCol,
  endCol,
}: DisplayResult) {
  const matched = displayLine.slice(startCol, endCol)
  return <span style={style}>{matched}</span>
}

interface CodeBlockProps {
  match: DisplayResult
}
export const CodeBlock = memo(({ match }: CodeBlockProps) => {
  return useReactive(() => {
    const { startCol, endCol, displayLine, lineSpan } = match
    const onClick = () => {
      openAction(match)
    }

    return (
      <div {...stylex.props(styles.box)} onClick={onClick}>
        <MultiLineIndicator lineSpan={lineSpan} />
        {displayLine.slice(0, startCol)}
        <Highlight {...match} />
        {displayLine.slice(endCol)}
      </div>
    )
  })

})
