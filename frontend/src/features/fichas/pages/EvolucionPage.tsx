import { useState, useEffect, type ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Save, Edit3, X } from 'lucide-react';
import { Evolucion, ContenidoClinico } from '../types';
import { getEvolucion, updateEvolucion } from '../services/fichaService';
import { useAuth } from '../../auth/context/AuthContext';
import Toast from '@/components/ui/Toast';

const CAMPOS_LABELS: { label: string; name: string }[] = [
    { label: "Motivo Consulta", name: "motivo_consulta" },
    { label: "Anamnesis", name: "anamnesis" },
    { label: "Examen Físico", name: "examen_fisico" },
    { label: "Diagnóstico", name: "diagnostico" },
    { label: "Intervenciones", name: "intervenciones" },
    { label: "Factores", name: "factores" },
    { label: "RAU Necesidades", name: "rau_necesidades" },
    { label: "Instrumentos Aplicados", name: "instrumentos_aplicados" },
];

const EvolucionPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [evolucion, setEvolucion] = useState<Evolucion | null>(null);
    const [editContenido, setEditContenido] = useState<ContenidoClinico | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const isDocente = user?.role === 'ADMIN' || user?.role === 'DOCENTE';
    const isOwner = evolucion?.creado_por === user?.id;
    const canEdit = isDocente || isOwner;

    useEffect(() => {
        if (id) {
            loadEvolucion(parseInt(id));
        }
    }, [id]);

    const loadEvolucion = async (evolucionId: number) => {
        try {
            const data = await getEvolucion(evolucionId);
            setEvolucion(data);
            setEditContenido({ ...data.contenido });
        } catch (error) {
            console.error('Error loading evolucion', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (!editContenido) return;
        const { name, value } = e.target;
        setEditContenido({ ...editContenido, [name]: value });
    };

    const handleSave = async () => {
        if (!evolucion || !editContenido) return;
        setSaving(true);
        try {
            const updated = await updateEvolucion(evolucion.id, { contenido: editContenido });
            setEvolucion(updated);
            setEditContenido({ ...updated.contenido });
            setIsEditing(false);
            setToast({ message: 'Evolución guardada exitosamente', type: 'success' });
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } };
            const msg = err.response?.data?.detail || 'Error al guardar la evolución';
            setToast({ message: msg, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (evolucion) {
            setEditContenido({ ...evolucion.contenido });
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aqua mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-worksans">Cargando evolución...</p>
                </div>
            </div>
        );
    }

    if (!evolucion) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Evolución no encontrada</h2>
                    <p className="text-gray-600 mb-4">La evolución que buscas no existe.</p>
                    <Link to="/casos-clinicos" className="text-aqua hover:text-blue-600 font-medium">
                        Volver a Casos Clínicos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-beige pb-12">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Top Navigation */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Volver a la atención
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-arizona font-medium text-gray-900">
                                Evolución #{evolucion.numero}
                            </h1>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${evolucion.tipo_autor === 'DOCENTE' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                {evolucion.tipo_autor}
                            </span>
                        </div>
                        <p className="text-gray-600 font-worksans text-sm">
                            Autor: {evolucion.nombre_autor}
                            {' · '}
                            {new Date(evolucion.fecha_creacion).toLocaleString('es-CL')}
                        </p>
                    </div>
                    {canEdit && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center px-4 py-2 bg-aqua text-white rounded-md hover:bg-blue-600 font-worksans text-sm font-medium"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar
                        </button>
                    )}
                    {isEditing && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancelEdit}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-worksans text-sm"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className={`inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-worksans text-sm font-medium ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    )}
                </div>

                <hr className="border-black mb-6" />

                {/* Campos clínicos */}
                <div className="space-y-6">
                    {CAMPOS_LABELS.map((field) => (
                        <div key={field.name} className="bg-white shadow-md rounded-lg p-5">
                            <label className="text-lg font-worksans font-semibold block mb-2">{field.label}</label>
                            {isEditing ? (
                                <textarea
                                    name={field.name}
                                    value={editContenido?.[field.name] || ''}
                                    onChange={handleFieldChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-aqua focus:border-aqua font-worksans min-h-[100px]"
                                    rows={4}
                                />
                            ) : (
                                <p className="font-worksans text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                                    {evolucion.contenido[field.name] || <span className="text-gray-400 italic">Sin completar</span>}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EvolucionPage;
