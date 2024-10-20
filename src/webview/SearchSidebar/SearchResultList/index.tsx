import { memo } from 'react'
import type { DisplayFileResult } from '../../../types.js'
import TreeItem from './TreeItem'
import { refVirtuoso } from './hooks.js'
import * as stylex from '@stylexjs/stylex'
import { Virtuoso } from 'react-virtuoso'
import { useReactive } from 'react-vue-use-reactive'
import { vueStore } from '../../store.js'

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


function itemContent(_: number, data: DisplayFileResult) {
  return <TreeItem className={'sg-match-tree-item'} data={data} />
}
function computeItemKey(_: number, data: DisplayFileResult) {
  return data.file
}
const SearchResultList = () => {
  return useReactive(() => {
    return (
      <Virtuoso
        ref={refVirtuoso}
        {...stylex.props(styles.resultList)}
        data={vueStore.grouped}
        itemContent={itemContent}
        computeItemKey={computeItemKey}
      />
    )
  })
}

export default memo(SearchResultList)
