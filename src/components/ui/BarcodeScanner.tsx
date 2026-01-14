import { useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X } from 'lucide-react';

interface Props {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export const BarcodeScanner = ({ onScanSuccess, onClose }: Props) => {

    useEffect(() => {
        const formatsToSupport = [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
        ];

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            // IMPORTANTE: Eliminamos 'aspectRatio' para evitar OverconstrainedError en móviles

            // CONFIGURACIÓN PARA CÁMARA TRASERA
            videoConstraints: {
                // 'environment' solicita la cámara trasera
                facingMode: { ideal: "environment" }
            },
            formatsToSupport: formatsToSupport
        };

        const html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            config,
            false
        );

        const onScanSuccessCallback = (decodedText: string) => {
            html5QrcodeScanner.clear().then(() => {
                onScanSuccess(decodedText);
            }).catch(error => {
                console.error("Error al limpiar scanner", error);
            });
        };

        // Manejo de errores silencioso para no llenar la consola mientras escanea
        const onScanFailureCallback = (errorMessage: string) => {
            // No hacer nada, es normal que falle mientras busca el código
        };

        html5QrcodeScanner.render(onScanSuccessCallback, onScanFailureCallback);

        return () => {
            html5QrcodeScanner.clear().catch(error => console.error("Error limpieza final", error));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl overflow-hidden relative">

                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md text-slate-800 hover:bg-red-50 hover:text-red-500"
                >
                    <X size={24} />
                </button>

                <div className="p-4 bg-slate-800 text-white text-center">
                    <h3 className="font-bold text-lg">Escanear Código</h3>
                    <p className="text-xs text-slate-400">Apunta la cámara al código</p>
                </div>

                {/* Contenedor del scanner */}
                <div id="reader" className="w-full bg-black min-h-[300px]"></div>

                <div className="p-4 text-center text-xs text-slate-500">
                    Si no detecta, intenta mejorar la iluminación.
                </div>
            </div>
        </div>
    );
};