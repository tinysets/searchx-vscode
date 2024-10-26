import { CodeBlock } from './CodeBlock'
import { MatchActions } from './Actions'
import type { DisplayFileResult, DisplayResult } from '../../../common/types.js'
import { useHover } from 'react-use'

import { memo } from 'react'
import * as stylex from '@stylexjs/stylex'
import { useReactive } from 'react-vue-use-reactive'
import { vueStore } from '../../store'

const styles = stylex.create({
  codeItem: {
    display: 'flex',
    paddingLeft: 38,
    paddingRight: 2,
    listStyle: 'none',
    ':hover': {
      background: 'var( --vscode-list-hoverBackground)',
    },
  },
  active: {
    background: 'var(--vscode-list-inactiveSelectionBackground)',
    ':focus': {
      color: 'var(--vscode-list-activeSelectionForeground)',
      background: 'var(--vscode-list-activeSelectionBackground)',
      outline:
        '1px solid var(--vscode-list-focusAndSelectionOutline, var(--vscode-contrastActiveBorder, var(--vscode-list-focusOutline)))',
      outlineOffset: -1,
    },
  },
})

function OneMatch({ match }: { match: DisplayResult }) {
  return useReactive(() => {
    let active = match == vueStore.activeItem
    let setActive = () => { vueStore.activeItem = match }

    const styleProps = stylex.props(styles.codeItem, active && styles.active)
    const [hoverable] = useHover(hovered => {
      return (
        // biome-ignore lint/a11y/noNoninteractiveTabindex: need it for styling
        <li {...styleProps} onClick={setActive} tabIndex={0}>
          <CodeBlock match={match} />
          {(hovered || active) && <MatchActions match={match} />}
        </li>
      )
    })
    return hoverable
  })
}

interface CodeBlockListProps {
  data: DisplayFileResult
}
export const MatchList = memo(({ data }: CodeBlockListProps) => {
  return useReactive(() => {
    return (
      <>
        {data?.results.map(match => {
          const { file, range } = match
          const { byteOffset } = range
          const key = file + byteOffset.start + byteOffset.end
          return <OneMatch key={key} match={match} />
        })}
      </>
    )
  })
})
