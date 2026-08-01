import type createOverflowObserver from '../observers/overflow'
import type createResizeObserver from '../observers/resize'

type Observers = {
  overflow: ReturnType<typeof createOverflowObserver>
  resize: ReturnType<typeof createResizeObserver>
}

export default {} as Observers
