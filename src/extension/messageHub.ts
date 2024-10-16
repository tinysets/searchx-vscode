import { Unport } from 'unport'
import type { ParentPort } from '../types.js'

export const parentPort: ParentPort = new Unport()
