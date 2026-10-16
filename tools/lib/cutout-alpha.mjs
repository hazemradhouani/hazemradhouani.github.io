// Lightweight, browser-safe cutout checks. This does not try to judge the drawing's subject;
// it checks two objective delivery invariants: alpha edges must not carry opaque paper-white
// pixels, and antialiased source detail must survive as partial alpha somewhere in the asset.
export function inspectCutoutRgba(data, width, height) {
  const maxSamples = 250000;
  const stride = Math.max(1, Math.ceil(Math.sqrt((width * height) / maxSamples)));
  let partialAlpha = 0;
  let opaqueWhiteEdge = 0;
  const alphaAt = (x, y) => data[(y * width + x) * 4 + 3];

  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4;
      const alpha = data[i + 3];
      if (alpha > 0 && alpha < 255) partialAlpha++;
      if (alpha < 250) continue;
      let bordersTransparency = false;
      for (let oy = -1; oy <= 1 && !bordersTransparency; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (!ox && !oy) continue;
          const nx = x + ox; const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) { bordersTransparency = true; break; }
          if (alphaAt(nx, ny) === 0) { bordersTransparency = true; break; }
        }
      }
      if (bordersTransparency && data[i] >= 245 && data[i + 1] >= 245 && data[i + 2] >= 245) opaqueWhiteEdge++;
    }
  }
  return {
    partialAlpha,
    opaqueWhiteEdge,
    hasDetail: partialAlpha > 0,
    hasWhiteFringe: opaqueWhiteEdge > 0
  };
}
