import TreeHeader from './TreeHeader'
import type { DisplayFileResult } from '../../../types.js'
import { MatchList } from './MatchList'
import { memo } from 'react'
import { useInView } from './useListState'
import * as stylex from '@stylexjs/stylex'
import { vueStore } from '../../store'
import { useReactive } from 'react-vue-use-reactive'

const styles = stylex.create({
  treeItem: {
    position: 'relative',
    background: 'var(--vscode-sideBar-background)',
    '::before': {
      content: '',
      display: 'block',
      position: 'absolute',
      top: '22px',
      bottom: 0,
      left: '13px', // left 16px - translateX 3px
      width: 0.6, // for retina screen, non-retina screen will round it to 1px
      backgroundColor: 'var(--vscode-tree-inactiveIndentGuidesStroke)',
      transition: '0.1s opacity linear',
    },
  },
  activeIndent: {
    '::before': {
      backgroundColor: 'var(--vscode-tree-indentGuidesStroke)',
      opacity: 1,
    },
  },
})

interface TreeItemProps {
  className: string
  data: DisplayFileResult
}

const TreeItem = ({ className, data }: TreeItemProps) => {
  return useReactive(() => {
    const filePath = data.file
    let isExpanded = data.expanded;
    let { inView, ref } = useInView(filePath)
    let isTreeActive = data == vueStore.activeItem
    const props = stylex.props(
      styles.treeItem,
      isTreeActive && styles.activeIndent,
    )

    return (
      <div className={`${className} ${props.className}`} style={props.style}>
        <div className="scroll-observer" ref={ref} />
        <TreeHeader
          isExpanded={isExpanded}
          toggleIsExpanded={() => { data.expanded = !data.expanded }}
          data={data}
          inView={inView}
        />
        <ul style={{ display: isExpanded ? '' : 'none' }}>
          <MatchList data={data} />
        </ul>
      </div>
    )
  })
}
export default memo(TreeItem)
