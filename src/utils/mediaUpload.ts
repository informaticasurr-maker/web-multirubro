/**
 * Media upload and compression utility
 * Supports image optimization (canvas compression) and video validation (duration limit <= 120s)
 */

export interface VideoValidationResult {
  dataUrl: string;
  duration: number; // in seconds
  formattedDuration: string;
  fileSizeMb: number;
}

export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')} min`;
}

/**
 * Compresses an image file from device/computer using HTML5 Canvas.
 * Keeps aspect ratio, scales to max dimensions, and outputs optimized JPEG data URL.
 */
export async function compressBase64DataUrl(
  dataUrl: string,
  maxWidth = 700,
  maxHeight = 900,
  quality = 0.65
): Promise<string> {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  // If already lightweight (< 80 KB), return as is
  if (dataUrl.length < 80000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}

export async function generateVideoPosterThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(file);
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, (video.duration || 2) / 2);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 500;
          let w = video.videoWidth || 500;
          let h = video.videoHeight || 700;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, w, h);
            const posterDataUrl = canvas.toDataURL('image/jpeg', 0.60);
            URL.revokeObjectURL(objectUrl);
            return resolve(posterDataUrl);
          }
        } catch { }
        URL.revokeObjectURL(objectUrl);
        resolve('');
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve('');
      };

      video.src = objectUrl;
    } catch {
      resolve('');
    }
  });
}

export async function compressImageFile(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<string> {
  const maxWidth = options.maxWidth || 500;
  const maxHeight = options.maxHeight || 800;
  const quality = options.quality !== undefined ? options.quality : 0.55;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo procesar la imagen seleccionada.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates and reads a video file from device/computer.
 * Enforces a maximum duration (default: 120 seconds = 2 minutes).
 */
export async function validateAndReadVideoFile(
  file: File,
  maxDurationSeconds = 120
): Promise<VideoValidationResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('video/')) {
      reject(new Error('El archivo seleccionado no es un formato de video válido (MP4, WebM, MOV).'));
      return;
    }

    const fileSizeMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    const cleanUp = () => {
      URL.revokeObjectURL(objectUrl);
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;

      if (!isFinite(duration) || isNaN(duration)) {
        cleanUp();
        reject(new Error('No se pudo determinar la duración del video.'));
        return;
      }

      if (duration > maxDurationSeconds) {
        cleanUp();
        const durationFormatted = formatSecondsToTime(duration);
        const maxFormatted = formatSecondsToTime(maxDurationSeconds);
        reject(
          new Error(
            `El video dura ${durationFormatted}, superando el límite máximo permitido de ${maxFormatted} (máximo 2 minutos). Por favor recorta el video o selecciona uno más corto.`
          )
        );
        return;
      }

      // Read as base64 data URL
      const reader = new FileReader();
      reader.onerror = () => {
        cleanUp();
        reject(new Error('Error al leer el archivo de video.'));
      };
      reader.onload = async (e) => {
        cleanUp();
        let dataUrl = e.target?.result as string;

        // If video data URL is heavy (> 700KB), generate a lightweight compressed poster image frame
        if (dataUrl && dataUrl.length > 700000) {
          const poster = await generateVideoPosterThumbnail(file);
          if (poster && poster.length > 0) {
            dataUrl = poster;
          }
        }

        resolve({
          dataUrl,
          duration,
          formattedDuration: formatSecondsToTime(duration),
          fileSizeMb
        });
      };
      reader.readAsDataURL(file);
    };

    video.onerror = () => {
      cleanUp();
      reject(new Error('No se pudo cargar el video para verificar su duración.'));
    };

    video.src = objectUrl;
  });
}
