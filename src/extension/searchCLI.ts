import { type ChildProcessWithoutNullStreams, spawn } from 'node:child_process'
import { resolveBinary, promisifyProc, resolveSearchxJSPath } from './callcli'
import { type SearchQuery, MessageType, WithId } from '../common/types'
import { QueryArgs, QueryResult } from '../common/interfaces'
import { Base64 } from '../common/base64'
import { parentPort } from './messageHub'
import { buildQueryArgs, buildDisplayResult } from './searchUtil'
import { onSearchResult } from './searchResult'
import path from 'node:path'

type StreamingHandler = (r: QueryResult[]) => void
let child: ChildProcessWithoutNullStreams | undefined

async function uniqueProc(
  proc: ChildProcessWithoutNullStreams | undefined,
  handler: StreamingHandler,
) {
  // kill previous search
  if (child) {
    child.kill('SIGTERM')
    child = undefined
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


function getElectronPath() {
  if (process.platform === 'darwin') {
    const execPath = process.execPath;
    const match = execPath.match(/(.*?\.app)/);
    if (match) {
      return path.join(match[1], 'Contents/MacOS/Electron');
    }
  }
  return process.execPath;
}

function spawnProc(query: QueryArgs) {
  const command = resolveBinary()
  const codePath = getElectronPath(); // code bin
  const jsPath = resolveSearchxJSPath()
  let cmdStr = `"${codePath}" "${jsPath}"`;
  console.log(cmdStr)
  // cmdStr = command;

  let base64 = Base64.jsonToBase64(query)
  console.log(base64)
  const args = ['--base64', base64]
  return spawn(cmdStr, args, {
    cwd: query.dir,
    shell: true, // it is safe because it is end user input
    env: {
      ...process.env,  // 继承当前环境变量
      VSCODE_DEV: '',
      ELECTRON_RUN_AS_NODE: '1'
    }
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
    let displayResults = ret.map((v) => buildDisplayResult(payload, v)).filter((v) => v != null);
    onSearchResult(payload, displayResults)
    parentPort.postMessage(MessageType.S2C_SearchResultStreaming, {
      ...payload,
      displayResults: displayResults,
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