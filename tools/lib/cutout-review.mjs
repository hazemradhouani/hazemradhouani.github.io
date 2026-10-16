// Review-sheet composites, kept apart from cutout.mjs so they can be tested without decoding a sheet.
// Every panel uses the exact same alpha derivative: white shows the light Field, charcoal exposes
// pale fringes, magenta makes the transparent regions unambiguous, and the fourth panel shows the
// drawing as the dark scheme renders it (D50), so a bad inversion is seen before it ships.
export const REVIEW_BACKDROPS = ['white', '0x121311', '0xff00ff'];

// CSS invert(.965) on each colour channel (alpha untouched): c' = 0.035 c + 0.965 (255 - c)
const INVERT = 'lutrgb=r=0.035*val+0.965*(255-val):g=0.035*val+0.965*(255-val):b=0.035*val+0.965*(255-val)';

/** The dark-scheme rendering of a cutout: [filter applied to the cutout, the ground it sits on]. */
export function darkRendering(dark) {
  if (dark === 'invert') return [INVERT, '0x121311'];
  // keep (D69): the drawing inverted like invert-accent, its solid rendered regions laid back on top (input 1)
  if (dark === 'invert-accent' || dark === 'keep') return [`${INVERT},hue=h=180`, '0x121311'];
  if (dark === 'field') return ['null', '0xF7F5EF'];
  return ['null', '0x121311'];
}

// With a keep layer (input 1, the same size as the cutout), the dark panel composites it over the inverted drawing.
export function reviewFilter(dark = null, { keep = false } = {}) {
  const [transform, ground] = darkRendering(dark);
  return [
    '[0:v]scale=640:-2:flags=lanczos,split=8[a][b][c][d][e][f][g][h]',
    ...(keep ? ['[1:v]scale=640:-2:flags=lanczos[kp]'] : []),
    '[b]drawbox=c=white:t=fill:replace=1[w]',
    '[d]drawbox=c=0x121311:t=fill:replace=1[k]',
    '[f]drawbox=c=0xff00ff:t=fill:replace=1[m]',
    `[h]drawbox=c=${ground}:t=fill:replace=1[z]`,
    `[g]${transform}[gd]`,
    '[w][a]overlay[ow]',
    '[k][c]overlay[od]',
    '[m][e]overlay[om]',
    ...(keep ? ['[z][gd]overlay[zg]', '[zg][kp]overlay[oz]'] : ['[z][gd]overlay[oz]']),
    '[ow][od][om][oz]hstack=inputs=4'
  ].join(';');
}

/** The densest region at 1:1: on white beside its dark-scheme rendering. tile = [x, y, w, h]. */
export function detailFilter(dark, [x, y, w, h], { keep = false } = {}) {
  const [transform, ground] = darkRendering(dark);
  return [
    `[0:v]crop=${w}:${h}:${x}:${y},split=4[a][b][c][d]`,
    ...(keep ? [`[1:v]crop=${w}:${h}:${x}:${y}[kp]`] : []),
    '[b]drawbox=c=white:t=fill:replace=1[w]',
    `[d]drawbox=c=${ground}:t=fill:replace=1[z]`,
    `[c]${transform}[ct]`,
    '[w][a]overlay[ow]',
    ...(keep ? ['[z][ct]overlay[zc]', '[zc][kp]overlay[oz]'] : ['[z][ct]overlay[oz]']),
    '[ow][oz]hstack=inputs=2'
  ].join(';');
}
