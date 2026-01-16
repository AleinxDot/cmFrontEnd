import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, RotateCcw } from 'lucide-react';

interface Props {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export const BarcodeScanner = ({ onScanSuccess, onClose }: Props) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [cameras, setCameras] = useState<any[]>([]);
    const [activeCameraId, setActiveCameraId] = useState<string | null>(null);

    useEffect(() => {

        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const startCamera = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                setCameras(devices);

                if (devices && devices.length) {
                    let rearCameraId = devices[0].id;

                    const backCamera = devices.find(device =>
                        device.label.toLowerCase().includes('back') ||
                        device.label.toLowerCase().includes('trasera') ||
                        device.label.toLowerCase().includes('environment')
                    );

                    if (backCamera) {
                        rearCameraId = backCamera.id;
                    } else if (devices.length > 1) {
                        rearCameraId = devices[devices.length - 1].id;
                    }

                    setActiveCameraId(rearCameraId);
                    runScanner(rearCameraId);
                } else {
                    setErrorMsg("No se detectaron cámaras.");
                }
            } catch (err) {
                console.error(err);
                setErrorMsg("Error al acceder a la cámara. Asegúrate de dar permisos.");
            }
        };

        const timer = setTimeout(() => {
            startCamera();
        }, 500);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current?.clear();
                }).catch(err => console.error("Error al detener", err));
            }
        };
    }, []);

    const runScanner = (cameraId: string) => {
        if (!scannerRef.current) return;

        const formatsToSupport = [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
        ];

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: formatsToSupport
        };

        scannerRef.current.start(
            cameraId,
            config,
            (decodedText) => {
                onScanSuccess(decodedText);
            },
            (errorMessage) => {
            }
        ).catch((err) => {
            console.error("Error al iniciar scanner", err);
            setErrorMsg("No se pudo iniciar la cámara seleccionada.");
        });
    };

    const handleSwitchCamera = () => {
        if (cameras.length > 1 && activeCameraId && scannerRef.current) {
            // Detenemos y cambiamos a la siguiente cámara
            scannerRef.current.stop().then(() => {
                const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
                const nextIndex = (currentIndex + 1) % cameras.length;
                const nextId = cameras[nextIndex].id;
                setActiveCameraId(nextId);
                runScanner(nextId);
            }).catch(console.error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center">

            {/* Botón Cerrar */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 text-white p-2 bg-slate-800 rounded-full hover:bg-red-600 transition"
            >
                <X size={32} />
            </button>

            {/* Título */}
            <div className="absolute top-10 text-white text-center z-10">
                <h3 className="text-xl font-bold">Escaneando...</h3>
                {cameras.length > 1 && (
                    <button
                        onClick={handleSwitchCamera}
                        className="mt-2 text-xs bg-slate-700 px-3 py-1 rounded-full flex items-center gap-2 mx-auto"
                    >
                        <RotateCcw size={14} /> Cambiar Cámara
                    </button>
                )}
            </div>

            {/* Área de Cámara */}
            <div className="w-full max-w-md aspect-square relative bg-black rounded-lg overflow-hidden border-2 border-slate-700">
                <div id="reader" className="w-full h-full object-cover"></div>

                {/* Guía visual */}
                {!errorMsg && (
                    <div className="absolute inset-0 border-2 border-red-500 opacity-50 m-16 rounded-lg pointer-events-none animate-pulse"></div>
                )}
            </div>

            {/* Mensajes de Error */}
            {errorMsg && (
                <div className="mt-4 p-3 bg-red-900/50 text-red-200 rounded text-sm max-w-xs text-center">
                    {errorMsg}
                    <button onClick={onClose} className="block w-full mt-2 font-bold underline">Cerrar</button>
                </div>
            )}
        </div>
    );
};