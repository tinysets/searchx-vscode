import type { ParentPort } from '../types.js'
import { Unport } from 'unport'

export const parentPort: ParentPort = new Unport()
