import { SearchInput } from './SearchInput'
const titleStyle = {
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  padding: '4px 0 0',
  fontSize: '11px',
  fontWeight: '400',
  lineHeight: '19px',
}

interface IncludeFileProps {
  fzfFile: string
  setFzfFile: (value: string) => void
  refreshResult: () => void
}

export default function FzfFile({
  fzfFile,
  setFzfFile,
  refreshResult,
}: IncludeFileProps) {
  return (
    <div>
      <h4 style={titleStyle}>files to Fzf</h4>
      <SearchInput
        isSingleLine={true}
        placeholder="e.g. play.cs, play.ts. Fzf pattern"
        value={fzfFile}
        onChange={setFzfFile}
        onKeyEnterUp={refreshResult}
      />
    </div>
  )
}
