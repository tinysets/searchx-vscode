import { VscEllipsis } from 'react-icons/vsc'
import * as stylex from '@stylexjs/stylex'
import IncludeFile from './IncludeFile'
import ExcludeFile from './ExcludeFile'
import FzfFile from './FzfFile'
import { vueStore } from '../../store'
import { useReactive } from 'react-vue-use-reactive'
import { refreshSearch } from '../../messageHub'

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

export default function SearchOptions() {

  return useReactive(() => {

    const includeFile = vueStore.includeFile
    const excludeFile = vueStore.excludeFile
    const fzfFile = vueStore.fzfFile
    const showOptions = vueStore.showOptions

    return (
      <div {...stylex.props(styles.options)}>
        <button
          type="button"
          {...stylex.props(styles.button)}
          onClick={() => { vueStore.showOptions = !showOptions }}
        >
          <VscEllipsis />
        </button>
        {showOptions && (
          <div style={{ paddingBottom: '6px' }}>
            <IncludeFile
              includeFile={includeFile}
              setIncludeFile={(value) => vueStore.includeFile = value}
              refreshResult={refreshSearch}
            />
            <FzfFile
              fzfFile={fzfFile}
              setFzfFile={(value) => vueStore.fzfFile = value}
              refreshResult={refreshSearch}
            />
            <ExcludeFile
              excludeFile={excludeFile}
              setExcludeFile={(value) => vueStore.excludeFile = value}
              refreshResult={refreshSearch}
            />
            {/* TODO: add file exclude*/}
            {/* <PatternConfig /> */}
          </div>
        )}
      </div>
    )
  })

}
