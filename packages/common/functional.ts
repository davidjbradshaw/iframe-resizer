// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any

export const isolateUserCode = (
  func: AnyFunction,
  ...val: unknown[]
): ReturnType<typeof setTimeout> => setTimeout(() => func(...val), 0)

export const once = <T extends AnyFunction>(fn: T): T => {
  let done = false

  return function (this: unknown, ...args: unknown[]) {
    return done ? undefined : ((done = true), fn.apply(this, args))
  } as unknown as T
}

export const invoke = <T>(fn: () => T): T => fn()

export const id = <T>(x: T): T => x
