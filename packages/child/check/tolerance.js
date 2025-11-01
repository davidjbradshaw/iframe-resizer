import settings from '../values/settings'

export default (a, b) => !(Math.abs(a - b) <= settings.tolerance)
