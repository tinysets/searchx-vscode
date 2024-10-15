import * as stylex from '@stylexjs/stylex'
import { VscArrowSmallRight, VscCaseSensitive, VscWholeWord } from 'react-icons/vsc'
import { VSCodeButton, } from '@vscode/webview-ui-toolkit/react'
import { useAtom } from 'jotai'
import { caseSensitiveAtom, forwardAtom, fullSearchAtom } from '../../store'

const styles = stylex.create({

  buttonContainer: {
    position: 'absolute',
    top: '3px',
    right: '3px',
    display: 'flex',
    flexDirection: 'row',
    gap: '4px',
  },
  button: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '2px', // 调整圆角
    padding: 0, // 移除内边距
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: 'var(--vscode-icon-foreground)',
    opacity: 0.7,
    transition: 'opacity 0.1s ease-in-out',
    ':hover': {
      opacity: 1,
      backgroundColor: 'var(--vscode-inputOption-hoverBackground)',
    },
  },
  activeButton: {
    opacity: 1,
    backgroundColor: 'var(--vscode-inputOption-activeBackground)',
    boxShadow: '0 0 0 1px var(--vscode-inputOption-activeBorder)',
    color: 'var(--vscode-inputOption-activeForeground)',
    ':hover': {
      backgroundColor: 'var(--vscode-inputOption-activeBackground)', // 保持激活状态的背景色
    },
  },
})

export function SearchToggles() {

  const [caseSensitive, setCaseSensitive] = useAtom(caseSensitiveAtom)
  const [forward, setForward] = useAtom(forwardAtom)
  const [fullSearch, setFullSearch] = useAtom(fullSearchAtom)

  return (
    <div {...stylex.props(styles.buttonContainer)}>
      <VSCodeButton
        appearance="icon"
        title="Match Case"
        onClick={() => setCaseSensitive(!caseSensitive)}
        {...stylex.props(styles.button, caseSensitive && styles.activeButton)}
      >
        <VscCaseSensitive />
      </VSCodeButton>
      <VSCodeButton
        appearance="icon"
        title="Full Search"
        onClick={() => setFullSearch(!fullSearch)}
        {...stylex.props(styles.button, fullSearch && styles.activeButton)}
      >
        <VscWholeWord />
      </VSCodeButton>
      <VSCodeButton
        appearance="icon"
        title="Forward Search"
        onClick={() => setForward(!forward)}
        {...stylex.props(styles.button, forward && styles.activeButton)}
      >
        <VscArrowSmallRight />
      </VSCodeButton>
    </div>

  )
}
