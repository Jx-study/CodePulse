/**
 * 以 Canvas 2D Path stroke 光柵化圖案邊線為 0/1 grid（alpha > 128 → 1）。
 */

export function rasterizePattern(
  pattern: string,
  W: number,
  H: number,
  borderWidth: number,
): number[][] {
  const canvas = new OffscreenCanvas(W, H);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return Array.from({ length: H }, () => Array.from({ length: W }, () => 0));
  }

  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = borderWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  drawPattern(ctx, pattern, W, H, borderWidth);

  const { data } = ctx.getImageData(0, 0, W, H);
  return Array.from({ length: H }, (_, r) =>
    Array.from({ length: W }, (_, c) => {
      const alpha = data[(r * W + c) * 4 + 3];
      return alpha > 128 ? 1 : 0;
    }),
  );
}

function drawPattern(
  ctx: OffscreenCanvasRenderingContext2D,
  pattern: string,
  W: number,
  H: number,
  _bw: number,
): void {
  const cx = W / 2;
  const cy = H / 2;

  switch (pattern) {
    case 'ring': {
      for (const r of [12, 32]) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }

    case 'star': {
      const n = 5;
      const rOut = 30;
      const rIn = 13;
      ctx.beginPath();
      for (let i = 0; i < n * 2; i++) {
        const angle = (i * Math.PI) / n - Math.PI / 2;
        const r = i % 2 === 0 ? rOut : rIn;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'heart': {
      const scale = W * 0.02;
      const offY = cy - H * 0.06;
      ctx.beginPath();
      for (let i = 0; i <= 360; i++) {
        const t = (i * Math.PI) / 180;
        const x = cx + 16 * Math.pow(Math.sin(t), 3) * scale;
        const y =
          offY -
          (13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t)) *
            scale;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'concentric': {
      for (const r of [10, 18, 26, 34]) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }

    case 'grid-rooms': {
      const spacing = 12;
      for (let r = 0; r < H; r += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, r);
        ctx.lineTo(W, r);
        ctx.stroke();
      }
      for (let c = 0; c < W; c += spacing) {
        ctx.beginPath();
        ctx.moveTo(c, 0);
        ctx.lineTo(c, H);
        ctx.stroke();
      }
      break;
    }

    default:
      break;
  }
}
