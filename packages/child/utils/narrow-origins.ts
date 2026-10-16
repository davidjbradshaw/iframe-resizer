// Once the window's origin is known, post only to that entry of the list
const narrowOrigins = (
  origins: string | string[],
  origin: string | undefined,
): string[] => {
  if (!Array.isArray(origins)) return [origins]
  return origin && origins.includes(origin) ? [origin] : origins
}

export default narrowOrigins
