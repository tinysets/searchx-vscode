import { SearchToggles } from './LangSelect'
import * as stylex from '@stylexjs/stylex'
import Editor from 'react-simple-code-editor';
import { patternAtom } from '../../store'
import { useAtom } from 'jotai';

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


function SearchWidgetContainer() {
  let [pattern, setPattern] = useAtom(patternAtom)

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
      <div {...stylex.props(styles.inputs)}>
        <Editor
          placeholder='Search'
          value={pattern}
          onValueChange={(value) => setPattern(value)}
          highlight={highlight}
          padding={padding}
          autoFocus={false}
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
      </div>
    </div>
  )

}

export default SearchWidgetContainer
