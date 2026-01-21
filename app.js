// ====== CANVAS SETUP ======
const upload = document.getElementById('upload');
const originalCanvas = document.getElementById('original');
const enhancedCanvas = document.getElementById('enhanced');

const oCtx = originalCanvas.getContext('2d');
const eCtx = enhancedCanvas.getContext('2d');

let originalImageData = null;

// ====== IMAGE LOAD ======
upload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    originalCanvas.width = enhancedCanvas.width = img.width;
    originalCanvas.height = enhancedCanvas.height = img.height;

    oCtx.drawImage(img, 0, 0);
    eCtx.drawImage(img, 0, 0);

    originalImageData = oCtx.getImageData(0, 0, img.width, img.height);
  };
  img.src = URL.createObjectURL(file);
});

// ====== CORE PIXEL ENGINE ======
function processPixels(callback) {
  const imageData = eCtx.getImageData(0, 0, enhancedCanvas.width, enhancedCanvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const [nr, ng, nb] = callback(r, g, b, i);

    data[i]     = nr;
    data[i + 1] = ng;
    data[i + 2] = nb;
  }

  eCtx.putImageData(imageData, 0, 0);
}

// ====== ALGORITHMS ======

// Contraste + Gamma
function enhance() {
  const contrast = 1.15;
  const gamma = 0.9;

  processPixels((r, g, b) => {
    r = Math.pow((r / 255), gamma) * 255;
    g = Math.pow((g / 255), gamma) * 255;
    b = Math.pow((b / 255), gamma) * 255;

    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;

    return [
      Math.min(255, Math.max(0, r)),
      Math.min(255, Math.max(0, g)),
      Math.min(255, Math.max(0, b))
    ];
  });
}

// Kernel convolution (Sharpen / Smooth)
function convolution(kernel, factor = 1, bias = 0) {
  const w = enhancedCanvas.width;
  const h = enhancedCanvas.height;
  const src = eCtx.getImageData(0, 0, w, h);
  const dst = eCtx.createImageData(w, h);

  const k = kernel;
  const side = Math.sqrt(k.length);
  const half = Math.floor(side / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < side; ky++) {
        for (let kx = 0; kx < side; kx++) {
          const px = Math.min(w - 1, Math.max(0, x + kx - half));
          const py = Math.min(h - 1, Math.max(0, y + ky - half));
          const idx = (py * w + px) * 4;
          const wt = k[ky * side + kx];

          r += src.data[idx] * wt;
          g += src.data[idx + 1] * wt;
          b += src.data[idx + 2] * wt;
        }
      }

      const i = (y * w + x) * 4;
      dst.data[i]     = Math.min(255, Math.max(0, r * factor + bias));
      dst.data[i + 1] = Math.min(255, Math.max(0, g * factor + bias));
      dst.data[i + 2] = Math.min(255, Math.max(0, b * factor + bias));
      dst.data[i + 3] = 255;
    }
  }

  eCtx.putImageData(dst, 0, 0);
}

// ====== BUTTONS ======
document.getElementById('enhance').onclick = enhance;

document.getElementById('sharpen').onclick = () => {
  convolution([
     0, -1,  0,
    -1,  5, -1,
     0, -1,  0
  ]);
};

document.getElementById('smooth').onclick = () => {
  convolution([
    1, 1, 1,
    1, 1, 1,
    1, 1, 1
  ], 1 / 9);
};

document.getElementById('reset').onclick = () => {
  if (!originalImageData) return;
  eCtx.putImageData(originalImageData, 0, 0);
};
