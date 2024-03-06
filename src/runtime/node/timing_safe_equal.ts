import { timingSafeEqual as impl } from 'node:crypto'

import type { TimingSafeEqual } from '../interfaces'

const timingSafeEqual: TimingSafeEqual = impl

export default timingSafeEqual
