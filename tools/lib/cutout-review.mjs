// The review-sheet composite is deliberately kept separate from cutout.mjs so it can be
// tested without decoding a full architectural sheet. Each panel uses the exact same
// alpha derivative: white shows the light Field, charcoal exposes pale/white fringes,
// and magenta makes transparent regions unambiguous.
export const REVIEW_BACKDROPS = ['white', '0x121311', '0xff00ff'];

export function reviewFilter() {
  return [
    '[0:v]scale=640:-2:flags=lanczos,split=6[a][b][c][d][e][f]',
    '[b]drawbox=c=white:t=fill[w]',
    '[d]drawbox=c=0x121311:t=fill[k]',
    '[f]drawbox=c=0xff00ff:t=fill[m]',
    '[w][a]overlay[ow]',
    '[k][c]overlay[od]',
    '[m][e]overlay[om]',
    '[ow][od][om]hstack=inputs=3'
  ].join(';');
}
