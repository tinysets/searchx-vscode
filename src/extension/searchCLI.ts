import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import { resolveBinary, promisifyProc } from './callcli'
import { type SearchQuery, MessageType, WithId } from '../common/types'
import { QueryArgs, QueryResult } from '../common/interfaces'
import { Base64 } from '../common/base64'
import { parentPort } from './messageHub'
import { buildQueryArgs, splitByHighlightToken } from './searchUtil'

type StreamingHandler = (r: QueryResult[]) => void
let child: ChildProcessWithoutNullStreams | undefined

async function uniqueProc(
  proc: ChildProcessWithoutNullStreams | undefined,
  handler: StreamingHandler,
) {
  // kill previous search
  if (child) {
    child.kill('SIGTERM')
  }
  if (!proc) {
    return Promise.resolve()
  }
  try {
    // set current proc to child
    child = proc
    await promisifyProc(proc, handler)
    // unset child only when the promise succeed
    // interrupted proc will be replaced by latter proc
    child = undefined
  } catch (e) {
    console.info('search aborted: ', e)
  }
}

function spawnProc(query: QueryArgs) {
  const command = resolveBinary()
  let base64 = Base64.jsonToBase64(query)
  console.log(base64)
  const args = ['--base64', base64]
  return spawn(command, args, {
    cwd: query.dir,
    shell: process.platform === 'win32', // it is safe because it is end user input
  })
}

interface Handlers {
  onData: StreamingHandler
  onError: (e: Error) => void
}
function execSearch(query: SearchQuery, handlers: Handlers) {
  const queryArgs = buildQueryArgs(query)
  if (!queryArgs) {
    return;
  }

  const proc = spawnProc(queryArgs)
  if (proc) {
    proc.on('error', error => {
      console.debug('searchx CLI runs error')
      handlers.onError(error)
    })
  }
  return uniqueProc(proc, handlers.onData)
}

export async function searchCLI(payload: WithId<SearchQuery>) {
  const onData = (ret: QueryResult[]) => {
    parentPort.postMessage(MessageType.S2C_SearchResultStreaming, {
      ...payload,
      searchResult: ret.map((v) => splitByHighlightToken(payload, v)).filter((v) => v != null),
    })
  }

  const onError = (error: Error) => {
    parentPort.postMessage(MessageType.S2C_Error, {
      ...payload,
      error,
    })
  }

  await execSearch(payload, { onData, onError, })

  parentPort.postMessage(MessageType.S2C_SearchEnd, payload)
}

export function stopSearchCLI() {
  // kill previous search
  if (child) {
    child.kill('SIGTERM')
    child = undefined;
  }
}