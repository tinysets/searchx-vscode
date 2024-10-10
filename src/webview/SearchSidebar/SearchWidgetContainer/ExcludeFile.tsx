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

interface ExcludeFileProps {
  excludeFile: string
  setExcludeFile: (value: string) => void
  refreshResult: () => void
}

export default function ExcludeFile({
  excludeFile,
  setExcludeFile,
  refreshResult,
}: ExcludeFileProps) {
  return (
    <div>
      <h4 style={titleStyle}>files to exclude</h4>
      <SearchInput
        isSingleLine={true}
        placeholder="e.g. *.ts, src/**/include. Glob pattern"
        value={excludeFile}
        onChange={setExcludeFile}
        onKeyEnterUp={refreshResult}
      />
    </div>
  )
}
