// filters.js
export const Filters = {

  enhance(core) {
    const contrast = 1.15;
    const gamma = 0.9;

    core.processPixels((r, g, b) => {
      r = Math.pow(r / 255, gamma) * 255;
      g = Math.pow(g / 255, gamma) * 255;
      b = Math.pow(b / 255, gamma) * 255;

      r = (r - 128) * contrast + 128;
      g = (g - 128) * contrast + 128;
      b = (b - 128) * contrast + 128;

      return [clamp(r), clamp(g), clamp(b)];
    });
  },

  sharpen(core) {
    core.convolution([
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0
    ]);
  },

  smooth(core) {
    core.convolution([
      1, 1, 1,
      1, 1, 1,
      1, 1, 1
    ], 1 / 9);
  },

  grayscale(core) {
    core.processPixels((r, g, b) => {
      const v = 0.299 * r + 0.587 * g + 0.114 * b;
      return [v, v, v];
    });
  }
};

function clamp(v) {
  return Math.max(0, Math.min(255, v));
}
