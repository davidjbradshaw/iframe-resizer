// checkBoth
export default ({ calculateWidth, calculateHeight }: { calculateWidth: boolean; calculateHeight: boolean }): boolean =>
  calculateWidth === calculateHeight
