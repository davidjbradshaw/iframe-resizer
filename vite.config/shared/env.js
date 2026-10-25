// The build flags, read once so every build script agrees on them. They were
// read as strings in some places and compared to '1' in others, so a value
// such as DEBUG=0 turned parts of one build on and parts of it off.
const flag = (value) => value === '1' || value === 'true'

export const BETA = flag(process.env.BETA)
export const DEBUG = flag(process.env.DEBUG)
export const TEST = flag(process.env.TEST)

// Only production builds remove log() and debug(); dev, beta and test builds
// keep them, so their dist and js/ bundles must agree
export const stripLog = !(DEBUG || BETA || TEST)
