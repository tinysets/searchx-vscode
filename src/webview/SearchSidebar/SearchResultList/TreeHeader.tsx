import { FileLink } from './FileLink'
import { FileActions } from './Actions'
import type { DisplayFileResult } from '../../../types.js'
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc'
import { VSCodeBadge } from '@vscode/webview-ui-toolkit/react'
import * as stylex from '@stylexjs/stylex'
import { useHover } from 'react-use'
import { vueStore } from '../../store'
import { useReactive } from 'react-vue-use-reactive'

const styles = stylex.create({
  fileName: {
    position: 'sticky',
    zIndex: 1, // not occluded by cover
    top: 0,
    cursor: 'pointer',
    display: 'flex',
    paddingLeft: 8,
    paddingRight: 2,
    lineHeight: '22px',
    height: '22px',
    alignItems: 'center',
    background: 'var(--vscode-sideBar-background)',
    ':hover': {
      background: 'var( --vscode-list-hoverBackground)',
    },
  },
  scrolled: {
    boxShadow: 'var(--vscode-scrollbar-shadow) 0 0 6px',
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
  toggleButton: {
    flex: 0,
    display: 'flex',
    alignItems: 'center',
    paddingRight: '4px',
  },
  badge: {
    marginLeft: 'auto',
    flex: '0 0 auto',
  },
})
interface TreeHeaderProps {
  isExpanded: boolean
  toggleIsExpanded: () => void
  data: DisplayFileResult
  inView: boolean
}

export default function TreeHeader({
  isExpanded,
  toggleIsExpanded,
  data,
  inView,
}: TreeHeaderProps) {

  return useReactive(() => {
    const { file: filePath, language } = data
    let active = data == vueStore.activeItem
    let setActive = () => { vueStore.activeItem = data }
    const styleProps = stylex.props(
      styles.fileName,
      !inView && styles.scrolled,
      active && styles.active,
    )
    const onClick = () => {
      toggleIsExpanded()
      setActive()
    }
    const element = (hovered: boolean) => (
      // biome-ignore lint/a11y/noNoninteractiveTabindex: need it for styling
      <div {...styleProps} onClick={onClick} tabIndex={0}>
        <div
          {...stylex.props(styles.toggleButton)}
          aria-label="expand/collapse button"
          role="button"
        >
          {isExpanded ? <VscChevronDown /> : <VscChevronRight />}
        </div>
        <FileLink filePath={filePath} language={language} />
        {hovered ? (
          <FileActions filePath={filePath} />
        ) : (
          <VSCodeBadge {...stylex.props(styles.badge)}>
            {data.results.length}
          </VSCodeBadge>
        )}
      </div>
    )
    const [hoverable] = useHover(element)
    return hoverable
  })
}
