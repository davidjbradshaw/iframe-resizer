import settings from '../values/settings'

const REQUIRED_MAJOR = 6

export default function meetsMinChildVersion(id: string): boolean {
  const version = settings[id]?.childVersion
  if (typeof version !== 'string') return false
  const major = Number.parseInt(version.split('.')[0], 10)
  return Number.isFinite(major) && major >= REQUIRED_MAJOR
}
