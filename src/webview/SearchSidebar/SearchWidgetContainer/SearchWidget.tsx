import { SearchToggles } from './LangSelect'
import * as stylex from '@stylexjs/stylex'
import Editor from 'react-simple-code-editor';
import escape from 'escape-html';
import { vueStore } from '../../store'
import { useReactive } from 'react-use-vue-reactive';
import { QueryTokenizer, QueryTokenType } from '../../../common/QueryTokenizer';

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


const queryTokenizer = new QueryTokenizer()

function SearchWidgetContainer() {
  return useReactive(() => {
    let highlight = (code: string) => {
      let newStr = ''
      let reslut = queryTokenizer.tokenize(code)
      for (const token of reslut) {
        if (token.type == QueryTokenType.FzfQueryWord || token.type == QueryTokenType.ExactQueryWord) {
          let text = token.token;
          newStr += `${escape(text.slice(0, -1))}<span class="keyword">${text.at(-1)}</span>`
        } else {
          newStr += escape(token.token) // 解决xss攻击
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
            value={vueStore.pattern}
            onValueChange={(value) => vueStore.pattern = value}
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
  })
}

export default SearchWidgetContainer
