import settings from '../values/settings'

export default function map2settings(data: Record<string, any>): void {
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) settings[key] = value
  }
}
