import { SearchInput } from './SearchInput'
import {
  VSCodeDropdown,
  VSCodeOption,
  VSCodeLink,
} from '@vscode/webview-ui-toolkit/react'
import { usePatternConfig, useSearchField } from '../../hooks/useQuery'
import { useCallback } from 'react'
import stylex from '@stylexjs/stylex'

const titleStyle = {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  padding: '4px 0 0',
  fontSize: '11px',
  fontWeight: '400',
  lineHeight: '19px',
}

const styles = stylex.create({
  button: {
    background: 'transparent',
    color: 'var(--vscode-foreground)',
    cursor: 'pointer',
    width: 'fit-content',
    alignSelf: 'end',
    textAlign: 'end',
    padding: '0 4px',
    height: '20px',
    flex: '0 0 auto',
    position: 'absolute',
    top: '0',
    right: '-2px', // vscode has two 2px right
  },
  options: {
    minHeight: '16px',
    marginLeft: '18px',
    position: 'relative',
  },
})

const NOOP = () => {}

function Link({ href }: { href: string }) {
  return (
    <VSCodeLink style={{ fontSize: '0.9em', marginLeft: '0.25em' }} href={href}>
      ⓘ
    </VSCodeLink>
  )
}

export default function WindowSizeConfig() {
  const [windowSize, setWindowSize] = useSearchField('windowSize')
  const onWindowSizeChange = useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: onChange event has wrong type signature.
    (e: any) => {
      const select = e.target as HTMLSelectElement
      setWindowSize(select.value)
    },
    [windowSize],
  )
  return (
    <div {...stylex.props(styles.options)}>
      <h4 style={titleStyle}>
        {/* search line window size */}
        {/* <Link href="https://ast-grep.github.io/advanced/match-algorithm.html" /> */}
      </h4>
      <VSCodeDropdown
        value={windowSize}
        onChange={onWindowSizeChange}
        style={{ width: '100%', zIndex: '2' }}
      >
        <VSCodeOption value="1">Every 1 Line</VSCodeOption>
        <VSCodeOption value="3">Every 2 Lines</VSCodeOption>
        <VSCodeOption value="5">Every 5 Lines</VSCodeOption>
        <VSCodeOption value="10">Every 10 Lines</VSCodeOption>
        <VSCodeOption value="20">Every 20 Lines</VSCodeOption>
      </VSCodeDropdown>
    </div>
  )
}
