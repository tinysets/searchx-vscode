import { Unport } from 'unport'
import type { ParentPort } from '../common/types.js'

export const parentPort: ParentPort = new Unport()
