import { memo } from 'react'
import type { DisplayResult } from '../../../types.js'
import TreeItem from './TreeItem'
import { refScroller } from './useListState'
import * as stylex from '@stylexjs/stylex'
import { Virtuoso } from 'react-virtuoso'

const styles = stylex.create({
  resultList: {
    flexGrow: 1,
    overflowY: 'scroll',
    ':not(:hover) .sg-match-tree-item::before': {
      opacity: 0,
    },
    ':hover .sg-match-tree-item::before': {
      opacity: 1,
    },
  },
})

interface SearchResultListProps {
  matches: Array<[string, DisplayResult[]]>
}

function itemContent(_: number, data: [string, DisplayResult[]]) {
  return <TreeItem className={'sg-match-tree-item'} matches={data[1]} />
}
function computeItemKey(_: number, data: [string, DisplayResult[]]) {
  return data[0]
}
const SearchResultList = ({ matches }: SearchResultListProps) => {
  return (
    <Virtuoso
      ref={refScroller}
      {...stylex.props(styles.resultList)}
      data={matches}
      itemContent={itemContent}
      computeItemKey={computeItemKey}
    />
  )
}

export default memo(SearchResultList)
