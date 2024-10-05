import type { ParentPort } from '../types'
import { Unport } from 'unport'

export const parentPort: ParentPort = new Unport()
