import { VERSION } from '@iframe-resizer/common/consts'

interface PageState {
  position: { x: number; y: number } | null
  version: string
}

const page: PageState = {
  position: null,
  version: VERSION,
}

export default page
