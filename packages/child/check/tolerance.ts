import settings from '../values/settings'

export default (a: number, b: number): boolean => !(Math.abs(a - b) <= settings.tolerance)
