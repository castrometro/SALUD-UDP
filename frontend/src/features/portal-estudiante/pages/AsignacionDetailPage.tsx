import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft, AlertCircle, FileText, Plus, MessageSquare, Stethoscope, User, Calendar, Lock,
} from 'lucide-react';
import { AtencionEstudiante, Evolucion, Vineta } from '@/features/fichas/types';
import {
    getAtencionEstudiante,
    getEvolucionesDeAsignacion,
    getVinetasDeAsignacion,
    crearEvolucion,
} from '../services/portalEstudianteService';
import { formatRut } from '@/utils/rut';
import Toast from '@/components/ui/Toast';

const AsignacionDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [asignacion, setAsignacion] = useState<AtencionEstudiante | null>(null);
    const [evoluciones, setEvoluciones] = useState<Evolucion[]>([]);
    const [vinetas, setVinetas] = useState<Vineta[]>([]);
    const [loading, setLoading] = useState(true);
    const [timelineLoading, setTimelineLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (id) loadAsignacion(parseInt(id));
    }, [id]);

    const loadAsignacion = async (asigId: number) => {
        try {
            const data = await getAtencionEstudiante(asigId);
            setAsignacion(data);
            await loadTimeline(asigId);
        } catch (error) {
            console.error('Error cargando asignación', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTimeline = async (asigId: number) => {
        setTimelineLoading(true);
        try {
            const [evData, vinData] = await Promise.all([
                getEvolucionesDeAsignacion(asigId),
                getVinetasDeAsignacion(asigId),
            ]);
            setEvoluciones(evData);
            setVinetas(vinData);
        } catch (error) {
            console.error('Error cargando timeline', error);
        } finally {
            setTimelineLoading(false);
        }
    };

    const handleCrearEvolucion = async () => {
        if (!asignacion) return;
        try {
            await crearEvolucion(asignacion.id, { tipo_autor: 'ESTUDIANTE' });
            setToast({ message: 'Evolución creada exitosamente', type: 'success' });
            await loadTimeline(asignacion.id);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } };
            const msg = err.response?.data?.detail || 'Error al crear evolución';
            setToast({ message: msg, type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aqua mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-worksans">Cargando asignación...</p>
                </div>
            </div>
        );
    }

    if (!asignacion) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Asignación no encontrada</h2>
                    <p className="text-gray-600 mb-4">La asignación que buscas no existe.</p>
                    <Link to="/mi-clinica" className="text-aqua hover:text-blue-600 font-medium">
                        Volver a Mi Clínica
                    </Link>
                </div>
            </div>
        );
    }

    const atencion = asignacion.atencion_clinica_detail;
    const paciente = atencion?.paciente_detail;

    // Merge viñetas + evoluciones ordenadas cronológicamente
    const timelineItems = [
        ...vinetas.map((v) => ({ tipo: 'vineta' as const, fecha: v.created_at, data: v })),
        ...evoluciones.map((e) => ({ tipo: 'evolucion' as const, fecha: e.fecha_creacion, data: e })),
    ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    return (
        <div className="bg-beige min-h-screen pb-12">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Top Navigation */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        to="/mi-clinica"
                        className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Volver a Mi Clínica
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header: Paciente + fecha */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold font-worksans">
                            Atención Clínica
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500 font-worksans">
                            <Calendar className="w-4 h-4" />
                            {atencion?.fecha_atencion
                                ? new Date(atencion.fecha_atencion + 'T00:00:00').toLocaleDateString('es-CL')
                                : '—'}
                        </span>
                    </div>
                    {paciente && (
                        <>
                            <h1 className="text-3xl font-arizona font-medium text-gray-900 mb-1 flex items-center gap-2">
                                <User className="w-7 h-7 text-aqua" />
                                {paciente.nombre} {paciente.apellido}
                            </h1>
                            <p className="text-gray-600 font-worksans text-sm">
                                RUT: {formatRut(paciente.rut)}
                            </p>
                        </>
                    )}
                    <hr className="border-black mt-4" />
                </div>

                {/* Perfil clínico del paciente (si existe) */}
                {paciente && (paciente.antecedentes_personales || paciente.medicamentos_habituales || paciente.alergias) && (
                    <details className="mb-6 border border-green-200 rounded-lg">
                        <summary className="cursor-pointer px-4 py-3 bg-green-50 rounded-lg font-worksans font-medium text-green-800 text-sm hover:bg-green-100 transition-colors">
                            Ver perfil clínico del paciente
                        </summary>
                        <div className="px-4 py-3 space-y-3 text-sm font-worksans text-gray-700">
                            {paciente.antecedentes_personales && (
                                <div>
                                    <span className="font-semibold">Antecedentes personales:</span>
                                    <p className="whitespace-pre-wrap">{paciente.antecedentes_personales}</p>
                                </div>
                            )}
                            {paciente.medicamentos_habituales && (
                                <div>
                                    <span className="font-semibold">Medicamentos habituales:</span>
                                    <p className="whitespace-pre-wrap">{paciente.medicamentos_habituales}</p>
                                </div>
                            )}
                            {paciente.alergias && (
                                <div>
                                    <span className="font-semibold">Alergias:</span>
                                    <p className="whitespace-pre-wrap">{paciente.alergias}</p>
                                </div>
                            )}
                        </div>
                    </details>
                )}

                {/* Línea de Tiempo */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <FileText className="w-6 h-6 mr-3 text-aqua" />
                            <h2 className="text-2xl font-worksans font-semibold">Línea de Tiempo</h2>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCrearEvolucion}
                                className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-worksans text-sm font-medium"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Nueva Evolución
                            </button>
                        </div>
                    </div>

                    {timelineLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aqua"></div>
                        </div>
                    ) : timelineItems.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-worksans">
                                No hay viñetas ni evoluciones aún. Crea tu primera evolución para comenzar.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {timelineItems.map((item) =>
                                item.tipo === 'vineta' ? (
                                    <div
                                        key={`vineta-${(item.data as Vineta).id}`}
                                        className="border-l-4 border-l-amber-400 border border-amber-200 rounded-lg p-4 bg-amber-50"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageSquare className="w-4 h-4 text-amber-600" />
                                            <span className="font-semibold text-amber-800 font-worksans text-sm">
                                                Viñeta #{(item.data as Vineta).numero}
                                            </span>
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                {(item.data as Vineta).creada_por_nombre || 'Docente'}
                                            </span>
                                        </div>
                                        <p className="text-gray-800 font-worksans text-sm whitespace-pre-wrap">
                                            {(item.data as Vineta).contenido}
                                        </p>
                                        <p className="text-xs text-gray-500 font-worksans mt-2">
                                            {new Date((item.data as Vineta).created_at).toLocaleString('es-CL')}
                                        </p>
                                    </div>
                                ) : (
                                    <Link
                                        key={`evo-${(item.data as Evolucion).id}`}
                                        to={`/mi-clinica/evolucion/${(item.data as Evolucion).id}`}
                                        className="block border border-gray-200 rounded-lg p-4 hover:border-aqua hover:shadow-md transition-all"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900 font-worksans">
                                                        Evolución #{(item.data as Evolucion).numero}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(item.data as Evolucion).tipo_autor === 'DOCENTE' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                        {(item.data as Evolucion).nombre_autor}
                                                    </span>
                                                    {(item.data as Evolucion).entregada && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            <Lock className="w-3 h-3 mr-1" />
                                                            Entregada
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 font-worksans">
                                                    {new Date((item.data as Evolucion).fecha_creacion).toLocaleString('es-CL')}
                                                </p>
                                            </div>
                                            <Stethoscope className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </Link>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AsignacionDetailPage;
