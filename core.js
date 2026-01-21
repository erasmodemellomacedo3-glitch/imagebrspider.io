// core.js
export class ImageCore {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.pipeline = [];
  }

  getImageData() {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  putImageData(imageData) {
    this.ctx.putImageData(imageData, 0, 0);
  }

  processPixels(callback) {
    const imageData = this.getImageData();
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = callback(
        data[i],
        data[i + 1],
        data[i + 2],
        i,
        data
      );

      data[i]     = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    this.putImageData(imageData);
  }

  convolution(kernel, factor = 1, bias = 0) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const src = this.getImageData();
    const dst = this.ctx.createImageData(w, h);

    const side = Math.sqrt(kernel.length);
    const half = Math.floor(side / 2);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0;

        for (let ky = 0; ky < side; ky++) {
          for (let kx = 0; kx < side; kx++) {
            const px = Math.min(w - 1, Math.max(0, x + kx - half));
            const py = Math.min(h - 1, Math.max(0, y + ky - half));
            const idx = (py * w + px) * 4;
            const wt = kernel[ky * side + kx];

            r += src.data[idx] * wt;
            g += src.data[idx + 1] * wt;
            b += src.data[idx + 2] * wt;
          }
        }

        const i = (y * w + x) * 4;
        dst.data[i]     = clamp(r * factor + bias);
        dst.data[i + 1] = clamp(g * factor + bias);
        dst.data[i + 2] = clamp(b * factor + bias);
        dst.data[i + 3] = 255;
      }
    }

    this.putImageData(dst);
  }

  // ===== PIPELINE =====
  addFilter(filterFn) {
    this.pipeline.push(filterFn);
  }

  clearPipeline() {
    this.pipeline = [];
  }

  runPipeline() {
    for (const filter of this.pipeline) {
      filter(this);
    }
  }
}

function clamp(v) {
  return Math.max(0, Math.min(255, v));
}
