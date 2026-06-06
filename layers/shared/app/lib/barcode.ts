import QRScanner from 'qr-scanner';

export type BarcodeDetectionResult = {
  rawValue: string;
};

export type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectionResult[]>;
};

export const createBarcodeDetector = (): BarcodeDetectorLike | null => {
  if (!globalThis.window) return null;

  const detectorCtor = (
    globalThis.window as Window & {
      BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike;
    }
  ).BarcodeDetector;

  if (!detectorCtor) return null;

  try {
    return new detectorCtor({ formats: ['qr_code'] });
  } catch {
    return new detectorCtor();
  }
};

// Fallback QR code detection using qr-scanner library
export const createFallbackDetector = (): BarcodeDetectorLike | null => {
  if (!globalThis.window) return null;

  return {
    detect: async (source: HTMLVideoElement) => {
      try {
        // Scan for QR codes in the video element
        const result = await QRScanner.scanImage(source, {
          returnDetailedScanResult: true,
        });

        if (result?.data) {
          console.info('✅ QR Code detected:', result.data);
          return [
            {
              rawValue: result.data,
            },
          ];
        }

        return [];
      } catch {
        // No QR code found or scanning error - this is normal
        return [];
      }
    },
  };
};
