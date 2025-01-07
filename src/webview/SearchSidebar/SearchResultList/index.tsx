import { memo, useDeferredValue } from 'react'
import type { DisplayFileResult } from '../../../common/types'
import TreeItem from './TreeItem'
import { refVirtuoso } from './hooks'
import * as stylex from '@stylexjs/stylex'
import { Virtuoso } from 'react-virtuoso'
import { useReactive } from 'react-use-vue-reactive'
import { vueStore } from '../../store'

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
  return data.filePath
}
const SearchResultList = () => {
  return useReactive(() => {
    const grouped = useDeferredValue(vueStore.grouped)
    return (
      <Virtuoso
        ref={refVirtuoso}
        {...stylex.props(styles.resultList)}
        data={grouped}
        itemContent={itemContent}
        computeItemKey={computeItemKey}
      />
    )
  })
}

export default memo(SearchResultList)
