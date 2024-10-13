import { VscEllipsis } from 'react-icons/vsc'
import PatternConfig from './PatternConfig'
import * as stylex from '@stylexjs/stylex'
import { useSearchOption, refreshResult } from '../../hooks/useQuery'
import IncludeFile from './IncludeFile'
import ExcludeFile from './ExcludeFile'
import FzfFile from './FzfFile'

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
  const {
    showOptions, toggleOptions,
    includeFile, setIncludeFile,
    excludeFile, setExcludeFile,
    fzfFile, setFzfFile,
  } =
    useSearchOption()
  return (
    <div {...stylex.props(styles.options)}>
      <button
        type="button"
        {...stylex.props(styles.button)}
        onClick={toggleOptions}
      >
        <VscEllipsis />
      </button>
      {showOptions && (
        <div style={{ paddingBottom: '6px' }}>
          <IncludeFile
            includeFile={includeFile}
            setIncludeFile={setIncludeFile}
            refreshResult={refreshResult}
          />
          <FzfFile
            fzfFile={fzfFile}
            setFzfFile={setFzfFile}
            refreshResult={refreshResult}
          />
          <ExcludeFile
            excludeFile={excludeFile}
            setExcludeFile={setExcludeFile}
            refreshResult={refreshResult}
          />
          {/* TODO: add file exclude*/}
          {/* <PatternConfig /> */}
        </div>
      )}
    </div>
  )
}
