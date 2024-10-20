import TreeHeader from './TreeHeader'
import type { DisplayFileResult } from '../../../types.js'
import { MatchList } from './MatchList'
import { memo } from 'react'
import { useToggleResult, useInView, useActiveFile } from './useListState'
import * as stylex from '@stylexjs/stylex'

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
  const filePath = data.file
  let [isExpanded, toggleIsExpanded] = useToggleResult(filePath)
  let { inView, ref } = useInView(filePath)
  let isTreeActive = useActiveFile(data.results)
  const props = stylex.props(
    styles.treeItem,
    isTreeActive && styles.activeIndent,
  )

  return (
    <div className={`${className} ${props.className}`} style={props.style}>
      <div className="scroll-observer" ref={ref} />
      <TreeHeader
        isExpanded={isExpanded}
        toggleIsExpanded={toggleIsExpanded}
        data={data}
        inView={inView}
      />
      <ul style={{ display: isExpanded ? '' : 'none' }}>
        <MatchList data={data} />
      </ul>
    </div>
  )
}
export default memo(TreeItem)
