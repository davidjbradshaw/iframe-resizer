import { advise, error } from '../console'
import settings from '../values/settings'

export default function isolate(funcs: (() => void)[]): void {
  const { mode } = settings
  funcs.forEach((func) => {
    try {
      func()
    } catch (error_) {
      if (mode < 0) throw error_
      advise(
        `<rb>Error in setup function</>\n<i>iframe-resizer</> detected an error during setup.\n\nPlease report the following error message at <u>https://github.com/davidjbradshaw/iframe-resizer/issues</>`,
      )
      error(error_)
    }
  })
}
