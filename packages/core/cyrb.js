/* eslint-disable pii/no-phone-number, no-bitwise */

export default (s1) => {
  if (!s1) return ''
  let h1 = 0xde_ad_be_ef ^ 7
  let h2 = 0x41_c6_ce_57 ^ 7
  for (let i = 0, ch; i < s1.length; i++) {
    ch = s1.codePointAt(i)
    h1 = Math.imul(h1 ^ ch, 0x85_eb_ca_77)
    h2 = Math.imul(h2 ^ ch, 0xc2_b2_ae_3d)
  }
  h1 ^= Math.imul(h1 ^ (h2 >>> 15), 0x73_5a_2d_97)
  h2 ^= Math.imul(h2 ^ (h1 >>> 15), 0xca_f6_49_a9)
  h1 ^= h2 >>> 16
  h2 ^= h1 >>> 16
  return (2_097_152 * (h2 >>> 0) + (h1 >>> 11)).toString(36)
}

/* eslint-enable pii/no-phone-number, no-bitwise */
