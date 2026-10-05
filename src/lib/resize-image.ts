export const MAX_IMAGE_SIDE = 1600;
/** Server limit on the decoded image (see functions/). */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const JPEG_QUALITIES = [0.85, 0.7, 0.55, 0.4];

export interface PreparedImage {
  /** Raw base64 (no `data:` prefix), as the server expects. */
  base64: string;
  mimeType: 'image/jpeg';
  /** Same image as a data URL, for the on-screen preview only. */
  previewUrl: string;
}

export type ImageErrorReason = 'unsupported-type' | 'unreadable' | 'too-large';

export class ImageError extends Error {
  constructor(readonly reason: ImageErrorReason) {
    super(reason);
    this.name = 'ImageError';
  }
}

/** Scales (width, height) down so the longest side is at most `max`; never upscales. */
export function fitWithin(
  width: number,
  height: number,
  max: number = MAX_IMAGE_SIDE,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const ratio = max / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

/** Size in bytes of the data encoded in a base64 string. */
export function base64ByteLength(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Decodes an image file, resizes it client-side to at most 1600 px on its
 * longest side and re-encodes it as JPEG under the 4 MB server limit.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new ImageError('unsupported-type');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageError('unreadable');
  }

  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new ImageError('unreadable');
    // JPEG has no alpha: paint white so transparent PNG areas do not turn black.
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    for (const quality of JPEG_QUALITIES) {
      const previewUrl = canvas.toDataURL('image/jpeg', quality);
      const base64 = previewUrl.slice(previewUrl.indexOf(',') + 1);
      if (base64ByteLength(base64) <= MAX_UPLOAD_BYTES) {
        return { base64, mimeType: 'image/jpeg', previewUrl };
      }
    }
    throw new ImageError('too-large');
  } finally {
    bitmap.close();
  }
}
