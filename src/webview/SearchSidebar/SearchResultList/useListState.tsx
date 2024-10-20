// maintains data list's UI state
// e.g. toggle expand selected item

import { useEffect, useRef } from 'react'
import { useBoolean } from 'react-use'
import type { VirtuosoHandle } from 'react-virtuoso'

let ref: VirtuosoHandle

export function refScroller(handle: VirtuosoHandle) {
  ref = handle
}

export function useInView(filePath: string) {

  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useBoolean(false)

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        setInView(true)
        console.log('html-viewCallback inView:' + filePath)
      } else {
        console.log('html-viewCallback outView:' + filePath)
        setInView(false)
      }
    })
    observer.observe(ref.current!)
    return () => {
      observer.disconnect()
    }
  }, [inView, setInView, filePath])

  return {
    inView,
    ref,
  }
}
