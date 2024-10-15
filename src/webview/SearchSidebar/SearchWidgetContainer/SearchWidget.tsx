import { VSCodeButton } from '@vscode/webview-ui-toolkit/react'
import {
  useSearchField,
  refreshResult,
  hasInitialRewrite,
} from '../../hooks/useQuery'
import { childPort } from '../../postMessage'
import { useSearchResult, acceptAllChanges } from '../../hooks/useSearch'
import { SearchInput } from './SearchInput'
import { SearchToggles } from './LangSelect'
import { useBoolean, useEffectOnce } from 'react-use'
import { VscChevronRight, VscChevronDown, VscReplaceAll } from 'react-icons/vsc'
import * as stylex from '@stylexjs/stylex'
import { MessageType } from '../../../types.js'
import Editor from 'react-simple-code-editor';
import { useState } from 'react'

const styles = stylex.create({
  container: {
    position: 'relative',
  },
  replaceToggle: {
    width: 16,
    height: '100%',
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      background: 'var(--vscode-toolbar-hoverBackground)',
    },
  },
  inputs: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginLeft: 18,
    flex: 1,
  },
  replaceToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  replaceAll: {
    height: 24,
    marginRight: -2,
  },
  // 新增：禁用状态下的样式
  disabledButton: {
    cursor: 'default', // 使用默认光标而不是"禁止"光标
  },
})

function ReplaceBar() {
  const [rewrite, setRewrite] = useSearchField('rewrite')
  const { searching, groupedByFileSearchResult } = useSearchResult()
  let disabled = !rewrite || searching || groupedByFileSearchResult.length === 0
  // disabled = false
  // sadly unport does not support unsub
  useEffectOnce(() => {
    childPort.onMessage(MessageType.ClearSearchResults, () => {
      setRewrite('')
    })
  })
  return (
    <div {...stylex.props(styles.replaceToolbar)}>
      <SearchInput
        placeholder="Replace"
        value={rewrite}
        onChange={setRewrite}
        onKeyEnterUp={refreshResult}
      />
      <VSCodeButton
        title="Replace All"
        appearance="icon"
        disabled={disabled}
        onClick={acceptAllChanges}
        {...stylex.props(styles.replaceAll, disabled && styles.disabledButton)}
      >
        <VscReplaceAll />
      </VSCodeButton>
    </div>
  )
}

function SearchWidgetContainer() {
  const [pattern, setPattern] = useSearchField('pattern')
  const [isExpanded, toggleIsExpanded] = useBoolean(hasInitialRewrite())

  const [code, setCode] = useState(
    `function add(a, b) {\n  return a + b;\n}`
  );

  // sadly unport does not support unsub
  useEffectOnce(() => {
    childPort.onMessage(MessageType.ClearSearchResults, () => {
      setPattern('')
    })
  })

  let highlight = (code: string) => {
    let newStr = ''
    for (const char of code) {
      if (char == '`' || char == `/`) {
        newStr += `<span class="keyword">${char}</span>`
      } else {
        newStr += char
      }
    }
    return newStr
  }

  let padding = { right: 70, left: 5, top: 3, bottom: 3 } as any
  return (
    <div {...stylex.props(styles.container)}>
      {/* <div {...stylex.props(styles.replaceToggle)} onClick={toggleIsExpanded}>
        {isExpanded ? <VscChevronDown /> : <VscChevronRight />}
      </div> */}
      <div {...stylex.props(styles.inputs)}>
        {/* <SearchInput
          placeholder="Search"
          value={pattern}
          onChange={setPattern}
          onKeyEnterUp={refreshResult}
        /> */}
        <Editor
          placeholder='Search'
          value={pattern}
          onValueChange={setPattern}
          highlight={highlight}
          padding={padding}
          onKeyUp={refreshResult}
          className='searchx-textarea-container'
          style={{
            // fontFamily: '"Fira code", "Fira Mono", monospace',
            // fontSize: 12,
            // width: "calc(100% - 66px)",
          }}
          textareaClassName='searchx-textarea'
          preClassName='searchx-textarea-pre'
        />
        <SearchToggles />
        {/* {isExpanded ? <ReplaceBar /> : null} */}
      </div>
    </div>
  )
}

export default SearchWidgetContainer
