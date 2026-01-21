// ui.js
import { ImageCore } from './core.js';
import { Filters } from './filters.js';

const upload = document.getElementById('upload');
const originalCanvas = document.getElementById('original');
const enhancedCanvas = document.getElementById('enhanced');

const oCtx = originalCanvas.getContext('2d');
const core = new ImageCore(enhancedCanvas);

let originalImageData = null;

upload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    originalCanvas.width = enhancedCanvas.width = img.width;
    originalCanvas.height = enhancedCanvas.height = img.height;

    oCtx.drawImage(img, 0, 0);
    core.ctx.drawImage(img, 0, 0);

    originalImageData = oCtx.getImageData(0, 0, img.width, img.height);
  };
  img.src = URL.createObjectURL(file);
});

// ===== PIPELINE CONFIG =====
document.getElementById('enhance').onclick = () => {
  core.clearPipeline();
  core.addFilter(Filters.enhance);
  core.addFilter(Filters.sharpen);
  core.runPipeline();
};

document.getElementById('sharpen').onclick = () => {
  core.clearPipeline();
  core.addFilter(Filters.sharpen);
  core.runPipeline();
};

document.getElementById('smooth').onclick = () => {
  core.clearPipeline();
  core.addFilter(Filters.smooth);
  core.runPipeline();
};

document.getElementById('reset').onclick = () => {
  if (!originalImageData) return;
  core.putImageData(originalImageData);
};
