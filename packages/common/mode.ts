/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable chai-friendly/no-unused-expressions */
/* eslint-disable no-bitwise */
/* eslint-disable no-cond-assign */
/* eslint-disable one-var */
/* eslint-disable pii/no-phone-number */
/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-shadow */
const l = (l: string): string => {
    if (!l) return ''
    let p = -559038744,
      y = 1103547984
    for (let z: any, t = 0; t < l.length; t++)
      ((z = l.codePointAt(t)),
        (p = Math.imul(p ^ z, 2246822519)),
        (y = Math.imul(y ^ z, 3266489917)))
    return (
      (p ^= Math.imul(p ^ (y >>> 15), 1935289751)),
      (y ^= Math.imul(y ^ (p >>> 15), 3405138345)),
      (p ^= y >>> 16),
      (y ^= p >>> 16),
      (2097152 * (y >>> 0) + (p >>> 11)).toString(36)
    )
  },
  p = (l: string): string =>
    l.replace(/[A-Za-z]/g, (l: any) =>
      String.fromCodePoint(
        (l <= 'Z' ? 90 : 122) >= (l = l.codePointAt(0) + 19) ? l : l - 26,
      ),
    ),
  i = new Date(),
  q = (f: (index: number, value: number) => string): Set<string> =>
    new Set(Array.from({ length: 9 }, f)),
  a = ' - lewpylk',
  x = ['spjluzl', 'rlf', 'clyzpvu', 'rlf2', 'nlaMbssFlhy'],
  y = [
    '<yi>Puchspk Spjluzl Rlf</><iy><iy>',
    '<yi>Tpzzpun Spjluzl Rlf</><iy><iy>',
    'Aopz spiyhyf pz hchpshisl dpao ivao Jvttlyjphs huk Vwlu-Zvbyjl spjluzlz.<iy><iy><i>Jvttlyjphs Spjluzl</><iy>Mvy jvttlyjphs bzl, <p>pmyhtl-ylzpgly</> ylxbpylz h svd jvza vul aptl spjluzl mll. Mvy tvyl pumvythapvu cpzpa <b>oaawz://pmyhtl-ylzpgly.jvt/wypjpun</>.<iy><iy><i>Vwlu Zvbyjl Spjluzl</><iy>Pm fvb hyl bzpun aopz spiyhyf pu h uvu-jvttlyjphs vwlu zvbyjl wyvqlja aolu fvb jhu bzl pa mvy myll bukly aol alytz vm aol NWS C3 Spjluzl. Av jvumpyt fvb hjjlwa aolzl alytz, wslhzl zla aol <i>spjluzl</> rlf pu <p>pmyhtl-ylzpgly</> vwapvuz av <i>NWSc3</>.<iy><iy>Mvy tvyl pumvythapvu wslhzl zll: <b>oaawz://pmyhtl-ylzpgly.jvt/nws</>',
    '<i>NWSc3 Spjluzl Clyzpvu</><iy><iy>Aopz clyzpvu vm <p>pmyhtl-ylzpgly</> pz ilpun bzlk bukly aol alytz vm aol <i>NWS C3</> spjluzl. Aopz spjluzl hssvdz fvb av bzl <p>pmyhtl-ylzpgly</> pu Vwlu Zvbyjl wyvqljaz, iba pa ylxbpylz fvby wyvqlja av il wbispj, wyvcpkl haaypibapvu huk il spjluzlk bukly clyzpvu 3 vy shaly vm aol NUB Nlulyhs Wbispj Spjluzl.<iy><iy>Pm fvb hyl bzpun aopz spiyhyf pu h uvu-vwlu zvbyjl wyvqlja vy dlizpal, fvb dpss ullk av wbyjohzl h svd jvza vul aptl jvttlyjphs spjluzl.<iy><iy>Mvy tvyl pumvythapvu cpzpa <b>oaawz://pmyhtl-ylzpgly.jvt/wypjpun</>.',
    '<iy><yi>Zvsv spjluzl kvlz uva zbwwvya jyvzz-kvthpu</><iy><iy>Av bzl <p>pmyhtl-ylzpgly</> dpao jyvzz kvthpu pmyhtlz fvb ullk lpaoly aol Wyvmlzzpvuhs vy Ibzpulzz spjluzlz. Mvy klahpsz vu bwnyhkl wypjpun wslhzl jvuahja pumv@pmyhtl-ylzpgly.jvt.',
    'Pu whnl spurpun ylxbpylz h Wyvmlzzpvuhs vy Ibzpulzz spjluzl. Wslhzl zll <b>oaawz://pmyhtl-ylzpgly.jvt/wypjpun</> mvy tvyl klahpsz.',
    '<yi>Clyzpvu 5 rlf klaljalk</><iy><iy>Fvb hyl jbyyluasf bzpun h spjluzl rlf mvy aol wylcpvbz clyzpvu vm <p>pmyhtl-ylzpgly</>.</><iy><iy>Av bwnyhkl av <i>Clyzpvu 6</> fvb jhu bzl aol <i>mpyza 11 johyhjalyz vm fvb spjluzl rlf</> av nla h 60% kpzjvbua ha oaawz://pmyhtl-ylzpgly.jvt/wypjpun.',
    '<yi>Clyzpvu 5 rlf klaljalk</><iy><iy>Fvb hyl jbyyluasf bzpun h spjluzl rlf mvy aol wylcpvbz clyzpvu vm <p>pmyhtl-ylzpgly</>.<iy><iy>Av bwnyhkl av <i>Clyzpvu 6</> vm <p>pmyhtl-ylzpgly</> wslhzl kvdusvhk aol shalza rlf myvt oaawz://pmyhtl-ylzpgly.jvt/tf-vyklyz.',
    '<yi> VLT rlf lewpylk</><iy><iy>Aol spjluzl rlf fvb hyl bzpun mvy <p>pmyhtl-ylzpgly</> pz myvt h wypvy flhy huk ohz lewpylk. Hu bwkhalk rlf pz ylslhzlk vu aol mpyza vm Uvcltily lhjo flhy.<iy><iy>Wslhzl kvdusvhk aol shalza rlf myvt oaawz://pmyhtl-ylzpgly.jvt/tf-vyklyz.',
  ],
  r = (arr: Array<string>): string[] => [
    arr[0],
    ...arr.slice(1).map((l) => `${l}${a}}`),
    `${arr[4]}${a}}`,
    ...arr.slice(1),
  ],
  z = r(['NWSc3', 'zvsv', 'wyv', 'ibzpulzz', 'VLT']),
  t = Object.fromEntries(
    [
      '2cgs7fdf4xb',
      '1c9ctcccr4z',
      '1q2pc4eebgb',
      'ueokt0969w',
      'w2zxchhgqz',
      '1umuxblj2e5',
      '1foobarqaz',
      '2b5sdlfhbev',
      'zo4ui3arjo',
      'oclbb4thgl',
      'igb1wzrjqr',
    ].map((l, p) => [l, Math.max(0, p - 1)]),
  ),
  u = new Set([1, 6]),
  dd = i[p(x[4])](),
  dx = q((_, i) => l(`${dd + i}`)),
  dy = q((_, i) => l(`${dd - ++i}`)),
  V = (n: string): number => (dx.has(n) ? 9 : dy.has(n) ? 5 : -2)
export const checkMode = (m: number): boolean => u.has(m)
export const getModeData = (l: number): string => p(y[l])
export const getModeLabel = (l: number): string => p(z[l])
export const getKey = (l: number): string => p(x[l])
export default (y: any): number => {
  const z = y[p(x[0])] || y[p(x[1])] || y[p(x[2])] || y[p(x[3])]
  if (!z) return -1
  const u = z.split('-')
  let v = (function (y = '', x = '') {
    let z = -2
    const u = l(p(y))
    return (u in t && (z = t[u]), z === 9 ? V(x) : z)
  })(...u)
  return (v === 0 || ((p: any) => p[2] === l(p[0] + p[1]))(u) || (v = -2), v)
}
