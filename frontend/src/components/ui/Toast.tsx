import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    duration?: number;
    onClose: () => void;
}

const Toast = ({ message, type = 'success', duration = 3000, onClose }: ToastProps) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // esperar animación de salida
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const isSuccess = type === 'success';

    return (
        <div className="fixed top-6 right-6 z-50">
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                } ${
                    isSuccess
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                }`}
            >
                {isSuccess ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <span className="font-worksans text-sm font-medium">{message}</span>
                <button
                    onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
                    className="ml-2 p-0.5 rounded hover:bg-black/5 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
