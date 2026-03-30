import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Calendar, User, ChevronRight } from 'lucide-react';
import { AtencionEstudiante } from '@/features/fichas/types';
import { PaginatedResponse } from '@/types/common';
import { getAtencionesEstudiante } from '../services/portalEstudianteService';
import { formatRut } from '@/utils/rut';

const MisAsignacionesPage = () => {
    const [asignaciones, setAsignaciones] = useState<AtencionEstudiante[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        loadAsignaciones();
    }, [page]);

    const loadAsignaciones = async () => {
        setLoading(true);
        try {
            const data: PaginatedResponse<AtencionEstudiante> = await getAtencionesEstudiante(page, pageSize);
            setAsignaciones(data.results);
            setTotalPages(Math.ceil(data.count / pageSize));
        } catch (error) {
            console.error('Error cargando asignaciones', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aqua mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-worksans">Cargando tus asignaciones...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-beige min-h-screen pb-12">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-aqua" />
                        <div>
                            <h1 className="text-3xl font-arizona font-medium text-gray-900">Mi Clínica</h1>
                            <p className="text-gray-500 font-worksans text-sm">Tus atenciones clínicas asignadas</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {asignaciones.length === 0 ? (
                    <div className="text-center py-16">
                        <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2 font-worksans">Sin asignaciones</h2>
                        <p className="text-gray-500 font-worksans">
                            Aún no tienes atenciones clínicas asignadas. Tu docente te asignará cuando corresponda.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {asignaciones.map((asig) => {
                                const atencion = asig.atencion_clinica_detail;
                                const paciente = atencion?.paciente_detail;
                                return (
                                    <Link
                                        key={asig.id}
                                        to={`/mi-clinica/asignacion/${asig.id}`}
                                        className="block bg-white rounded-lg shadow-md border border-gray-200 hover:border-aqua hover:shadow-lg transition-all p-5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <User className="w-5 h-5 text-aqua" />
                                                    <h3 className="text-lg font-worksans font-semibold text-gray-900">
                                                        {paciente
                                                            ? `${paciente.nombre} ${paciente.apellido}`
                                                            : 'Paciente'}
                                                    </h3>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-worksans">
                                                    {paciente && (
                                                        <span>RUT: {formatRut(paciente.rut)}</span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {atencion?.fecha_atencion
                                                            ? new Date(atencion.fecha_atencion + 'T00:00:00').toLocaleDateString('es-CL')
                                                            : '—'}
                                                    </span>
                                                    <span className="inline-block text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                        {asig.total_evoluciones} evolución(es)
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Paginación */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 text-sm font-worksans rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>
                                <span className="px-4 py-2 text-sm font-worksans text-gray-600">
                                    Página {page} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 text-sm font-worksans rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MisAsignacionesPage;
