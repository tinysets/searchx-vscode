import { MessageType, type ChildPort, type ChildToParent } from '../types.js'
import { Unport } from 'unport'
export type { DisplayResult, RangeInfo } from '../types.js'
export type OpenPayload = ChildToParent['openFile']

// 
const vscode = acquireVsCodeApi()

export const childPort: ChildPort = new Unport()

childPort.implementChannel({
  send(message) {
    vscode.postMessage(message)
  },
  accept(pipe) {
    window.addEventListener('message', ev => {
      pipe(ev.data)
    })
  },
})

export const openFile = (data: OpenPayload) => {
  childPort.postMessage(MessageType.OpenFile, data)
}

export function previewDiff(data: ChildToParent['previewDiff']) {
  childPort.postMessage(MessageType.PreviewDiff, data)
}

export function dismissDiff(data: ChildToParent['dismissDiff']) {
  childPort.postMessage(MessageType.DismissDiff, data)
}

export function commitChange(diff: ChildToParent['commitChange']) {
  childPort.postMessage(MessageType.CommitChange, diff)
}

export function replaceAll(payload: ChildToParent['replaceAll']) {
  childPort.postMessage(MessageType.ReplaceAll, payload)
}
