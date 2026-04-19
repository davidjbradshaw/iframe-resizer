export type SemVer = `${number}.${number}.${number}${string}`

export interface IFrameVersion {
  child: SemVer | 'legacy'
  parent: SemVer | 'legacy'
}
