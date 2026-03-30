import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Users, Plus, Stethoscope, FileText, MessageSquare, Search } from 'lucide-react';
import { AtencionClinica, AtencionEstudiante, Evolucion, Vineta } from '../types';
import {
    getAtencionClinica, asignarEstudiante,
    getEstudiantesDeAtencion, getEvolucionesDeAsignacion,
    crearEvolucion, crearVineta, getVinetasDeAsignacion
} from '../services/fichaService';
import { useAuth } from '../../auth/context/AuthContext';
import { formatRut } from '@/utils/rut';
import Toast from '@/components/ui/Toast';
import { getEstudiantes } from '@/features/estudiantes/services/estudianteService';
import { Estudiante } from '@/features/estudiantes/types';

const AtencionDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [atencion, setAtencion] = useState<AtencionClinica | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Estudiantes asignados
    const [asignaciones, setAsignaciones] = useState<AtencionEstudiante[]>([]);
    const [asignacionesLoading, setAsignacionesLoading] = useState(false);

    // Asignar estudiante form
    const [showAsignarForm, setShowAsignarForm] = useState(false);
    const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
    const [resultadosEstudiante, setResultadosEstudiante] = useState<Estudiante[]>([]);
    const [buscandoEstudiante, setBuscandoEstudiante] = useState(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
    const [asignando, setAsignando] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Evoluciones de la asignación seleccionada
    const [selectedAsignacion, setSelectedAsignacion] = useState<AtencionEstudiante | null>(null);
    const [evoluciones, setEvoluciones] = useState<Evolucion[]>([]);
    const [vinetas, setVinetas] = useState<Vineta[]>([]);
    const [evolucionesLoading, setEvolucionesLoading] = useState(false);

    // Crear viñeta
    const [showVinetaForm, setShowVinetaForm] = useState(false);
    const [vinetaContenido, setVinetaContenido] = useState('');

    // Crear evolución docente (con autor personalizable)
    const [showEvolucionForm, setShowEvolucionForm] = useState(false);
    const [evolucionAutor, setEvolucionAutor] = useState('');

    const isDocente = user?.role === 'ADMIN' || user?.role === 'DOCENTE';
    const isEstudiante = user?.role === 'ESTUDIANTE';

    useEffect(() => {
        if (id) {
            loadAtencion(parseInt(id));
        }
    }, [id]);

    const loadAtencion = async (atencionId: number) => {
        try {
            const data = await getAtencionClinica(atencionId);
            setAtencion(data);
            loadAsignaciones(atencionId);
        } catch (error) {
            console.error('Error loading atencion', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAsignaciones = async (atencionId: number) => {
        setAsignacionesLoading(true);
        try {
            const data = await getEstudiantesDeAtencion(atencionId);
            setAsignaciones(data);
        } catch (error) {
            console.error('Error loading asignaciones', error);
        } finally {
            setAsignacionesLoading(false);
        }
    };

    const handleBuscarEstudiante = (query: string) => {
        setBusquedaEstudiante(query);
        setSelectedEstudiante(null);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.trim().length < 2) {
            setResultadosEstudiante([]);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setBuscandoEstudiante(true);
            try {
                const data = await getEstudiantes(1, query.trim());
                setResultadosEstudiante(data.results);
            } catch {
                setResultadosEstudiante([]);
            } finally {
                setBuscandoEstudiante(false);
            }
        }, 400);
    };

    const handleAsignarEstudiante = async (e: FormEvent) => {
        e.preventDefault();
        if (!id || !selectedEstudiante) return;
        setAsignando(true);
        try {
            await asignarEstudiante(parseInt(id), selectedEstudiante.id);
            setToast({ message: 'Estudiante asignado exitosamente', type: 'success' });
            setBusquedaEstudiante('');
            setSelectedEstudiante(null);
            setResultadosEstudiante([]);
            setShowAsignarForm(false);
            loadAsignaciones(parseInt(id));
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string; estudiante_id?: string[] } } };
            const msg = err.response?.data?.detail || err.response?.data?.estudiante_id?.[0] || 'Error al asignar estudiante';
            setToast({ message: msg, type: 'error' });
        } finally {
            setAsignando(false);
        }
    };

    const handleSelectAsignacion = async (asignacion: AtencionEstudiante) => {
        setSelectedAsignacion(asignacion);
        setEvolucionesLoading(true);
        try {
            const [evData, vinData] = await Promise.all([
                getEvolucionesDeAsignacion(asignacion.id),
                getVinetasDeAsignacion(asignacion.id),
            ]);
            setEvoluciones(evData);
            setVinetas(vinData);
        } catch (error) {
            console.error('Error loading evoluciones/vinetas', error);
        } finally {
            setEvolucionesLoading(false);
        }
    };

    const handleCrearEvolucion = async (nombreAutor?: string) => {
        if (!selectedAsignacion) return;
        try {
            const tipoAutor = isEstudiante ? 'ESTUDIANTE' : 'DOCENTE';
            const payload: { tipo_autor: string; nombre_autor?: string } = { tipo_autor: tipoAutor };
            if (nombreAutor?.trim()) {
                payload.nombre_autor = nombreAutor.trim();
            }
            await crearEvolucion(selectedAsignacion.id, payload);
            setToast({ message: 'Evolución creada exitosamente', type: 'success' });
            setShowEvolucionForm(false);
            setEvolucionAutor('');
            const data = await getEvolucionesDeAsignacion(selectedAsignacion.id);
            setEvoluciones(data);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } };
            const msg = err.response?.data?.detail || 'Error al crear evolución';
            setToast({ message: msg, type: 'error' });
        }
    };

    const handleCrearVineta = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedAsignacion || !vinetaContenido.trim()) return;
        try {
            await crearVineta(selectedAsignacion.id, vinetaContenido.trim());
            setToast({ message: 'Viñeta creada exitosamente', type: 'success' });
            setVinetaContenido('');
            setShowVinetaForm(false);
            const data = await getVinetasDeAsignacion(selectedAsignacion.id);
            setVinetas(data);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { detail?: string } } };
            const msg = err.response?.data?.detail || 'Error al crear viñeta';
            setToast({ message: msg, type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aqua mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-worksans">Cargando atención clínica...</p>
                </div>
            </div>
        );
    }

    if (!atencion) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Atención no encontrada</h2>
                    <p className="text-gray-600 mb-4">La atención clínica que buscas no existe.</p>
                    <Link to="/casos-clinicos" className="text-aqua hover:text-blue-600 font-medium">
                        Volver a Casos Clínicos
                    </Link>
                </div>
            </div>
        );
    }

    const paciente = atencion.paciente_detail;
    const casoDetail = atencion.caso_clinico_detail;

    return (
        <div className="bg-beige pb-12">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {/* Top Navigation */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-4">
                    {casoDetail && (
                        <Link
                            to={`/casos-clinicos/${casoDetail.id}`}
                            className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            {casoDetail.titulo}
                        </Link>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold font-worksans">
                            Atención Clínica
                        </span>
                        <span className="text-sm text-gray-500 font-worksans">
                            {new Date(atencion.fecha_atencion).toLocaleDateString('es-CL')}
                        </span>
                    </div>
                    {paciente && (
                        <>
                            <h1 className="text-4xl font-arizona font-medium text-gray-900 mb-1">
                                {paciente.nombre} {paciente.apellido}
                            </h1>
                            <p className="text-gray-600 font-worksans">
                                RUT: {formatRut(paciente.rut)}
                                {' · '}
                                <Link to={`/pacientes/${paciente.id}`} className="text-aqua hover:text-blue-600">
                                    Ver paciente
                                </Link>
                            </p>
                        </>
                    )}
                    {casoDetail && (
                        <p className="text-sm text-gray-500 font-worksans mt-2">
                            Caso: {casoDetail.titulo}
                        </p>
                    )}
                    <hr className="border-black mt-4" />
                </div>

                {/* Caso description collapsible */}
                {casoDetail?.descripcion && (
                    <details className="mb-6 border border-blue-200 rounded-lg">
                        <summary className="cursor-pointer px-4 py-3 bg-blue-50 rounded-lg font-worksans font-medium text-blue-800 text-sm hover:bg-blue-100 transition-colors">
                            Ver descripción del caso clínico
                        </summary>
                        <div className="px-4 py-3 font-worksans text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {casoDetail.descripcion}
                        </div>
                    </details>
                )}

                {/* Estudiantes Asignados */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <Users className="w-6 h-6 mr-3 text-aqua" />
                            <h2 className="text-2xl font-worksans font-semibold">Estudiantes Asignados</h2>
                        </div>
                        {isDocente && (
                            <button
                                onClick={() => setShowAsignarForm(!showAsignarForm)}
                                className="inline-flex items-center px-3 py-2 bg-aqua text-white rounded-md hover:bg-blue-600 font-worksans text-sm font-medium"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Asignar Estudiante
                            </button>
                        )}
                    </div>

                    {/* Assign form */}
                    {showAsignarForm && isDocente && (
                        <form onSubmit={handleAsignarEstudiante} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1 font-worksans">Buscar Estudiante</label>
                            <div className="relative">
                                <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-aqua focus-within:border-aqua">
                                    <Search className="w-4 h-4 text-gray-400 ml-3" />
                                    <input
                                        type="text"
                                        value={busquedaEstudiante}
                                        onChange={(e) => handleBuscarEstudiante(e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm border-0 focus:ring-0 focus:outline-none rounded-md"
                                        placeholder="Nombre, apellido, RUT o email..."
                                        autoComplete="off"
                                    />
                                    {buscandoEstudiante && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-aqua mr-3"></div>
                                    )}
                                </div>
                                {/* Resultados de búsqueda */}
                                {resultadosEstudiante.length > 0 && !selectedEstudiante && (
                                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {resultadosEstudiante.map((est) => (
                                            <li key={est.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedEstudiante(est);
                                                        setBusquedaEstudiante(`${est.first_name} ${est.last_name} (${formatRut(est.rut)})`);
                                                        setResultadosEstudiante([]);
                                                    }}
                                                    className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm font-worksans flex justify-between items-center"
                                                >
                                                    <span className="font-medium">{est.first_name} {est.last_name}</span>
                                                    <span className="text-gray-500 text-xs">{formatRut(est.rut)}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {busquedaEstudiante.trim().length >= 2 && !buscandoEstudiante && resultadosEstudiante.length === 0 && !selectedEstudiante && (
                                    <p className="text-xs text-gray-500 mt-1 font-worksans">Sin resultados para "{busquedaEstudiante}"</p>
                                )}
                            </div>
                            {selectedEstudiante && (
                                <div className="flex items-center justify-between mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                                    <span className="text-sm font-worksans">
                                        <span className="font-medium">{selectedEstudiante.first_name} {selectedEstudiante.last_name}</span>
                                        {' · '}{formatRut(selectedEstudiante.rut)} · {selectedEstudiante.email}
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={asignando}
                                        className={`px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 font-worksans text-sm ${asignando ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {asignando ? 'Asignando...' : 'Asignar'}
                                    </button>
                                </div>
                            )}
                        </form>
                    )}

                    {asignacionesLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aqua"></div>
                        </div>
                    ) : asignaciones.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-worksans">No hay estudiantes asignados.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {asignaciones.map((asig) => (
                                <button
                                    key={asig.id}
                                    onClick={() => handleSelectAsignacion(asig)}
                                    className={`text-left border rounded-lg p-4 transition-all ${selectedAsignacion?.id === asig.id ? 'border-aqua bg-blue-50 shadow-md' : 'border-gray-200 hover:border-aqua hover:shadow-md'}`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <span className="text-green-700 font-semibold text-sm">
                                                {asig.estudiante_nombre?.charAt(0) || '?'}
                                            </span>
                                        </div>
                                        <span className="font-semibold text-gray-900 font-worksans text-sm">
                                            {asig.estudiante_nombre || 'Estudiante'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-worksans">
                                        Asignado: {new Date(asig.fecha_asignacion).toLocaleDateString()}
                                    </p>
                                    <span className="inline-block mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        {asig.total_evoluciones} evolución(es)
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Evoluciones de la asignación seleccionada */}
                {selectedAsignacion && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <FileText className="w-6 h-6 mr-3 text-aqua" />
                                <h2 className="text-2xl font-worksans font-semibold">
                                    Línea de Tiempo — {selectedAsignacion.estudiante_nombre}
                                </h2>
                            </div>
                            <div className="flex gap-2">
                                {isDocente && (
                                    <button
                                        onClick={() => setShowVinetaForm(!showVinetaForm)}
                                        className="inline-flex items-center px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-worksans text-sm font-medium"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-1" />
                                        Nueva Viñeta
                                    </button>
                                )}
                                {(isDocente || (isEstudiante && selectedAsignacion.estudiante === user?.id)) && (
                                    <button
                                        onClick={() => {
                                            if (isDocente) {
                                                setShowEvolucionForm(!showEvolucionForm);
                                            } else {
                                                handleCrearEvolucion();
                                            }
                                        }}
                                        className="inline-flex items-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-worksans text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Nueva Evolución
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Formulario de viñeta */}
                        {showVinetaForm && isDocente && (
                            <form onSubmit={handleCrearVineta} className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <label className="block text-sm font-medium text-gray-700 mb-1 font-worksans">Contenido de la Viñeta</label>
                                <textarea
                                    value={vinetaContenido}
                                    onChange={(e) => setVinetaContenido(e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                                    placeholder="Ej: Paciente consulta por dolor torácico opresivo de 3 horas de evolución..."
                                    required
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setShowVinetaForm(false); setVinetaContenido(''); }}
                                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-worksans"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-worksans text-sm font-medium"
                                    >
                                        Crear Viñeta
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Formulario de evolución docente (nombre autor) */}
                        {showEvolucionForm && isDocente && (
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleCrearEvolucion(evolucionAutor); }}
                                className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200"
                            >
                                <label className="block text-sm font-medium text-gray-700 mb-1 font-worksans">
                                    Nombre del autor (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={evolucionAutor}
                                    onChange={(e) => setEvolucionAutor(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                                    placeholder={`Ej: Dr. González (Urgenciólogo) — vacío usa "${user?.first_name} ${user?.last_name}"`}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setShowEvolucionForm(false); setEvolucionAutor(''); }}
                                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-worksans"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 font-worksans text-sm font-medium"
                                    >
                                        Crear Evolución
                                    </button>
                                </div>
                            </form>
                        )}

                        {evolucionesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aqua"></div>
                            </div>
                        ) : (vinetas.length === 0 && evoluciones.length === 0) ? (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-worksans">No hay viñetas ni evoluciones registradas.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {[
                                    ...vinetas.map((v) => ({ tipo: 'vineta' as const, fecha: v.created_at, data: v })),
                                    ...evoluciones.map((e) => ({ tipo: 'evolucion' as const, fecha: e.fecha_creacion, data: e })),
                                ]
                                    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                                    .map((item) =>
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
                                                    {(item.data as Vineta).creada_por_nombre} — {new Date((item.data as Vineta).created_at).toLocaleString('es-CL')}
                                                </p>
                                            </div>
                                        ) : (
                                            <Link
                                                key={`evo-${(item.data as Evolucion).id}`}
                                                to={`/evoluciones/${(item.data as Evolucion).id}`}
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
                )}
            </div>
        </div>
    );
};

export default AtencionDetailPage;
