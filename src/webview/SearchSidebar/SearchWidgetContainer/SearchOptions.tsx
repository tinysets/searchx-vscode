import { VscEllipsis } from 'react-icons/vsc'
import * as stylex from '@stylexjs/stylex'
import { refreshSearch } from '../../hooks/useQuery'
import IncludeFile from './IncludeFile'
import ExcludeFile from './ExcludeFile'
import FzfFile from './FzfFile'
import { useAtom } from 'jotai'
import { excludeFileAtom, fzfFileAtom, includeFileAtom, showOptionsAtom } from '../../store'

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

  const [includeFile, setIncludeFile] = useAtom(includeFileAtom)
  const [excludeFile, setExcludeFile] = useAtom(excludeFileAtom)
  const [fzfFile, setFzfFile] = useAtom(fzfFileAtom)
  const [showOptions, setShowOptions] = useAtom(showOptionsAtom)
  const toggleOptions = () => { setShowOptions(!showOptions) }

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
            refreshResult={refreshSearch}
          />
          <FzfFile
            fzfFile={fzfFile}
            setFzfFile={setFzfFile}
            refreshResult={refreshSearch}
          />
          <ExcludeFile
            excludeFile={excludeFile}
            setExcludeFile={setExcludeFile}
            refreshResult={refreshSearch}
          />
          {/* TODO: add file exclude*/}
          {/* <PatternConfig /> */}
        </div>
      )}
    </div>
  )
}
