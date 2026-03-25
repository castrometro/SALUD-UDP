import { useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import PacienteSelect from '../components/PacienteSelect';
import { createAtencionClinica } from '../services/fichaService';
import Toast from '@/components/ui/Toast';

const AtencionFormPage = () => {
    const { casoId } = useParams<{ casoId: string }>();
    const navigate = useNavigate();
    const [pacienteId, setPacienteId] = useState<number | undefined>();
    const [fechaAtencion, setFechaAtencion] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!casoId || !pacienteId) {
            setToast({ message: 'Debes seleccionar un paciente', type: 'error' });
            return;
        }
        if (!fechaAtencion) {
            setToast({ message: 'Debes seleccionar una fecha de atención', type: 'error' });
            return;
        }
        setSaving(true);
        try {
            const atencion = await createAtencionClinica({
                caso_clinico: parseInt(casoId),
                paciente: pacienteId,
                fecha_atencion: fechaAtencion,
            });
            navigate(`/atenciones/${atencion.id}`);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string; non_field_errors?: string[] } } };
            const msg = err.response?.data?.detail
                || err.response?.data?.non_field_errors?.[0]
                || 'Error al crear la atención clínica';
            setToast({ message: msg, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-beige pb-12">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        to={`/casos-clinicos/${casoId}`}
                        className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Volver al caso
                    </Link>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-arizona font-medium text-gray-900 mb-6">
                    Nueva Atención Clínica
                </h1>

                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 font-worksans mb-1">
                            Paciente <span className="text-red-500">*</span>
                        </label>
                        <PacienteSelect value={pacienteId} onChange={(id) => setPacienteId(id)} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 font-worksans mb-1">
                            Fecha de Atención <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={fechaAtencion}
                            onChange={(e) => setFechaAtencion(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-aqua focus:border-aqua sm:text-sm"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Link
                            to={`/casos-clinicos/${casoId}`}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-worksans text-sm"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`inline-flex items-center px-4 py-2 bg-aqua text-white rounded-md hover:bg-blue-600 font-worksans text-sm font-medium ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Creando...' : 'Crear Atención'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AtencionFormPage;
