import { useRef, useState, useEffect, useCallback } from 'react';
import { CameraOff } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRScannerLiteProps {
  onDetect: (code: string) => void;
  onClose: () => void;
}

export default function QRScannerLite({ onDetect, onClose }: QRScannerLiteProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [camState, setCamState] = useState<'starting' | 'active' | 'denied' | 'error'>('starting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const detectedRef = useRef(false);
  const mountedRef = useRef(false);
  const [scannerId] = useState(() => `qr-lite-${Math.random().toString(36).slice(2, 8)}`);

  const stopCamera = useCallback(async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try { await scannerRef.current.stop(); } catch { /* ignore */ }
    }
    scannerRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const startCamera = async () => {
      if (!mountedRef.current) return;

      detectedRef.current = false;

      // Wait for DOM element to be available
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!mountedRef.current) return;

      try {
        console.log('[QRScanner] Initializing scanner...');
        const scanner = new Html5Qrcode(scannerId, {
          verbose: true,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        });
        scannerRef.current = scanner;

        console.log('[QRScanner] Getting cameras...');
        const cameras = await Html5Qrcode.getCameras();
        console.log('[QRScanner] Cameras found:', cameras?.length || 0);

        if (!cameras || cameras.length === 0) {
          if (mountedRef.current) {
            setCamState('denied');
            setErrorMessage('Nenhuma camera encontrada.');
          }
          return;
        }

        // Prefer back camera
        const backCamera = cameras.find(
          (c) => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('traseira')
        ) || cameras[cameras.length - 1];

        console.log('[QRScanner] Starting camera:', backCamera.label);

        if (!mountedRef.current) return;

        await scanner.start(
          backCamera.id,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            console.log('[QRScanner] QR detected:', decodedText);
            if (detectedRef.current) return;
            detectedRef.current = true;
            stopCamera();
            onDetect(decodedText);
          },
          () => {
            // Scan frame error - ignore
          }
        );

        console.log('[QRScanner] Camera started successfully');
        if (mountedRef.current) {
          setCamState('active');
        }
      } catch (err: unknown) {
        console.error('[QRScanner] Error:', err);
        const errorMsg = err instanceof Error ? err.message : '';
        const errorName = (err as { name?: string })?.name || '';

        if (!mountedRef.current) return;

        if (errorName === 'NotAllowedError' || errorMsg.includes('Permission')) {
          setCamState('denied');
          setErrorMessage('Permissao negada. Permita o acesso a camera.');
        } else {
          setCamState('error');
          setErrorMessage('Erro ao abrir camera. Use o campo manual.');
        }
        await stopCamera();
      }
    };

    startCamera();

    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [scannerId, onDetect, stopCamera]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-dark-800 rounded-xl overflow-hidden border border-white/10">
        {/* Scanner container - MUST be visible for html5-qrcode to work */}
        <div
          id={scannerId}
          className="w-full h-full"
          style={{ minHeight: '300px' }}
        />

        {/* Overlay for status messages */}
        {camState !== 'active' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-4 bg-dark-800">
            {camState === 'starting' && (
              <div className="text-white/40 text-sm">Iniciando camera...</div>
            )}
            {(camState === 'denied' || camState === 'error') && (
              <>
                <CameraOff size={28} className="text-red-400/60" />
                <div className="text-sm text-red-400/70">{errorMessage}</div>
              </>
            )}
          </div>
        )}
      </div>

      <button onClick={onClose} className="w-full py-2.5 text-sm text-white/40 border border-white/10 rounded-xl hover:bg-white/5">
        Fechar Camera
      </button>
    </div>
  );
}
