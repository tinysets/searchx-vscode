import * as stylex from '@stylexjs/stylex'
import { vueStore } from '../store'
import { useReactive } from 'react-use-vue-reactive'
const styles = stylex.create({
  progressBar: {
    width: '100%',
    flex: '0 0 auto',
    height: '6px',
    overflow: 'hidden',
    position: 'relative',
  },
})

export default function LoadingBar() {

  return useReactive(() => {
    let loading = vueStore.searching
    const style = {
      display: loading ? '' : 'none',
      position: 'absolute',
      top: '0',
    } as const
    return (
      <div
        {...stylex.props(styles.progressBar)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuenow={5}
        aria-valuemax={10}
        aria-hidden={!loading}
      >
        <div className="progressBar" style={style} />
      </div>
    )
  })
}
