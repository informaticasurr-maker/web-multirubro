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
export async function compressImageFile(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<string> {
  const maxWidth = options.maxWidth || 1024;
  const maxHeight = options.maxHeight || 1024;
  const quality = options.quality !== undefined ? options.quality : 0.82;

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
          // Fallback to original data URL if canvas 2D context is unavailable
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
      reader.onload = (e) => {
        cleanUp();
        resolve({
          dataUrl: e.target?.result as string,
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
