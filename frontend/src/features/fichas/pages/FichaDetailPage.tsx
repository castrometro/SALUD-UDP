import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Users, FileText, Plus, Trash2, BookOpen } from 'lucide-react';
import { Plantilla, CasoClinico, FichaEstudiante } from '../types';
import {
    getPlantilla, deletePlantilla,
    getCasosClinicos, createCasoClinico, deleteCasoClinico,
    getFichasEstudiantesDeCaso
} from '../services/fichaService';
import { useAuth } from '../../auth/context/AuthContext';
import PacienteSelect from '../components/PacienteSelect';
import { formatRut } from '@/utils/rut';
import Toast from '@/components/ui/Toast';

type TabType = 'contenido' | 'casos' | 'estudiantes';

const FichaDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [plantilla, setPlantilla] = useState<Plantilla | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [activeTab, setActiveTab] = useState<TabType>('contenido');

    // Casos clínicos
    const [casos, setCasos] = useState<CasoClinico[]>([]);
    const [casosLoading, setCasosLoading] = useState(false);
    const [casosLoaded, setCasosLoaded] = useState(false);

    // Fichas de estudiantes (agrupadas por caso)
    const [fichasEstudiantes, setFichasEstudiantes] = useState<Map<number, FichaEstudiante[]>>(new Map());
    const [estudiantesLoading, setEstudiantesLoading] = useState(false);
    const [estudiantesLoaded, setEstudiantesLoaded] = useState(false);

    // Crear caso clínico
    const [showCasoForm, setShowCasoForm] = useState(false);
    const [nuevoPacienteId, setNuevoPacienteId] = useState<number | undefined>();

    // Toast
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const isDocente = user?.role === 'ADMIN' || user?.role === 'DOCENTE';

    useEffect(() => {
        if (id) {
            loadPlantilla(parseInt(id));
        }
    }, [id]);

    const loadPlantilla = async (plantillaId: number) => {
        try {
            const data = await getPlantilla(plantillaId);
            setPlantilla(data);
        } catch (error) {
            console.error('Error loading plantilla', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCasos = async (force = false) => {
        if (!id || (!force && casosLoaded)) return;
        setCasosLoading(true);
        try {
            const data = await getCasosClinicos(1, 1000, parseInt(id));
            setCasos(data.results);
            setCasosLoaded(true);
        } catch (error) {
            console.error('Error loading casos', error);
        } finally {
            setCasosLoading(false);
        }
    };

    const loadFichasEstudiantes = async () => {
        if (!id || estudiantesLoaded || !casosLoaded) return;
        setEstudiantesLoading(true);
        try {
            const fichasMap = new Map<number, FichaEstudiante[]>();
            for (const caso of casos) {
                const data = await getFichasEstudiantesDeCaso(caso.id, 1, 1000);
                fichasMap.set(caso.id, data.results);
            }
            setFichasEstudiantes(fichasMap);
            setEstudiantesLoaded(true);
        } catch (error) {
            console.error('Error loading fichas estudiantes', error);
        } finally {
            setEstudiantesLoading(false);
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        if (tab === 'casos' && !casosLoaded) {
            loadCasos();
        } else if (tab === 'estudiantes') {
            if (!casosLoaded) {
                loadCasos().then(() => loadFichasEstudiantes());
            } else if (!estudiantesLoaded) {
                loadFichasEstudiantes();
            }
        }
    };

    const handleCrearCaso = async () => {
        if (!id || !nuevoPacienteId) return;
        setIsProcessing(true);
        try {
            await createCasoClinico({ plantilla: parseInt(id), paciente: nuevoPacienteId });
            setShowCasoForm(false);
            setNuevoPacienteId(undefined);
            setCasosLoaded(false);
            setEstudiantesLoaded(false);
            // Recargar plantilla para actualizar contadores del header
            const plantillaActualizada = await getPlantilla(parseInt(id));
            setPlantilla(plantillaActualizada);
            await loadCasos(true);
            setToast({ message: 'Caso clínico asignado exitosamente', type: 'success' });
        } catch (error: any) {
            console.error('Error creating caso', error);
            const msg = error.response?.data?.paciente?.[0] || error.response?.data?.non_field_errors?.[0] || error.response?.data?.detail || 'Error al crear caso clínico';
            setToast({ message: msg, type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteCaso = async (casoId: number) => {
        if (!window.confirm('¿Eliminar este caso clínico?')) return;
        try {
            await deleteCasoClinico(casoId);
            setCasos(prev => prev.filter(c => c.id !== casoId));
            setEstudiantesLoaded(false);
            if (id) {
                const plantillaActualizada = await getPlantilla(parseInt(id));
                setPlantilla(plantillaActualizada);
            }
            setToast({ message: 'Caso clínico eliminado', type: 'success' });
        } catch (error: any) {
            console.error('Error deleting caso', error);
            const msg = error.response?.data?.detail || 'Error al eliminar el caso clínico';
            setToast({ message: msg, type: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setIsProcessing(true);
        try {
            await deletePlantilla(parseInt(id));
            navigate('/plantillas');
        } catch (error: any) {
            console.error('Error deleting plantilla', error);
            const msg = error.response?.data?.detail || 'Error al eliminar la plantilla';
            setToast({ message: msg, type: 'error' });
        } finally {
            setIsProcessing(false);
            setShowDeleteModal(false);
        }
    };

    const valoracionFields = [
        { label: "Factores", name: "factores" },
        { label: "Anamnesis", name: "anamnesis" },
        { label: "Motivo Consulta", name: "motivo_consulta" },
        { label: "RAU Necesidades", name: "rau_necesidades" },
        { label: "Examen Físico", name: "examen_fisico" },
        { label: "Instrumentos Aplicados", name: "instrumentos_aplicados" },
    ];

    if (loading) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aqua mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-worksans">Cargando plantilla...</p>
                </div>
            </div>
        );
    }

    if (!plantilla) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Plantilla no encontrada</h2>
                    <p className="text-gray-600 mb-4">La plantilla que buscas no existe o fue eliminada.</p>
                    <Link to="/plantillas" className="text-aqua hover:text-blue-600 font-medium">
                        Volver a Plantillas
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
                    <Link to="/plantillas" className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Plantillas Clínicas
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold font-worksans">
                                    Plantilla
                                </span>
                                <span className="text-sm text-gray-500 font-worksans">
                                    {plantilla.total_casos} caso(s) &middot; {plantilla.total_estudiantes} estudiante(s)
                                </span>
                            </div>
                            <h1 className="text-4xl font-arizona font-medium text-gray-900 mb-2">
                                {plantilla.titulo}
                            </h1>
                            {plantilla.descripcion && (
                                <p className="text-gray-600 font-worksans">{plantilla.descripcion}</p>
                            )}
                            <p className="text-sm text-gray-500 font-worksans mt-2">
                                Creada por {plantilla.creado_por_nombre || 'Desconocido'} el {new Date(plantilla.fecha_creacion).toLocaleDateString()}
                            </p>
                        </div>
                        {isDocente && (
                            <div className="flex gap-2">
                                <Link
                                    to={`/plantillas/${plantilla.id}/editar`}
                                    className="px-4 py-2 bg-aqua text-white rounded-md hover:bg-blue-600 font-worksans font-medium"
                                >
                                    Editar
                                </Link>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 font-worksans font-medium"
                                >
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                    <hr className="border-black mt-4" />
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => handleTabChange('contenido')}
                                className={`group inline-flex items-center py-4 px-1 border-b-2 font-worksans font-medium text-sm ${activeTab === 'contenido' ? 'border-aqua text-aqua' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <BookOpen className={`mr-2 h-5 w-5 ${activeTab === 'contenido' ? 'text-aqua' : 'text-gray-400'}`} />
                                Contenido Clínico
                            </button>

                            {isDocente && (
                                <button
                                    onClick={() => handleTabChange('casos')}
                                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-worksans font-medium text-sm ${activeTab === 'casos' ? 'border-aqua text-aqua' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    <FileText className={`mr-2 h-5 w-5 ${activeTab === 'casos' ? 'text-aqua' : 'text-gray-400'}`} />
                                    Casos Clínicos
                                    {casosLoaded && casos.length > 0 && (
                                        <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-blue-100 text-blue-800">{casos.length}</span>
                                    )}
                                </button>
                            )}

                            {isDocente && (
                                <button
                                    onClick={() => handleTabChange('estudiantes')}
                                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-worksans font-medium text-sm ${activeTab === 'estudiantes' ? 'border-aqua text-aqua' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    <Users className={`mr-2 h-5 w-5 ${activeTab === 'estudiantes' ? 'text-aqua' : 'text-gray-400'}`} />
                                    Fichas de Estudiantes
                                </button>
                            )}
                        </nav>
                    </div>
                </div>

                {/* TAB: Contenido Clínico */}
                {activeTab === 'contenido' && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-worksans font-semibold mb-6">Valoración</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {valoracionFields.map((field, index) => (
                                <div key={index} className="col-span-1">
                                    <label className="text-lg font-worksans font-semibold block mb-1">{field.label}</label>
                                    <div className="w-full border rounded-md p-2 bg-gray-100 border-gray-200 min-h-[60px] font-worksans text-sm whitespace-pre-wrap">
                                        {plantilla.contenido[field.name] || <span className="text-gray-400 italic">Sin contenido</span>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-2xl font-worksans font-semibold mt-6">Diagnóstico</h3>
                        <div className="w-full border rounded-md p-2 bg-gray-100 border-gray-200 min-h-[60px] font-worksans text-sm whitespace-pre-wrap mt-2">
                            {plantilla.contenido.diagnostico || <span className="text-gray-400 italic">Sin contenido</span>}
                        </div>

                        <h3 className="text-2xl font-worksans font-semibold mt-6">Intervenciones</h3>
                        <div className="w-full border rounded-md p-2 bg-gray-100 border-gray-200 min-h-[60px] font-worksans text-sm whitespace-pre-wrap mt-2">
                            {plantilla.contenido.intervenciones || <span className="text-gray-400 italic">Sin contenido</span>}
                        </div>
                    </div>
                )}

                {/* TAB: Casos Clínicos (pacientes asignados) */}
                {activeTab === 'casos' && isDocente && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <FileText className="w-6 h-6 mr-3 text-aqua" />
                                <h2 className="text-2xl font-worksans font-semibold">Casos Clínicos</h2>
                            </div>
                            <button
                                onClick={() => setShowCasoForm(!showCasoForm)}
                                className="inline-flex items-center px-3 py-2 bg-aqua text-white rounded-md hover:bg-blue-600 font-worksans text-sm"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Asignar a Paciente
                            </button>
                        </div>

                        {/* Formulario para crear caso */}
                        {showCasoForm && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-800 font-worksans text-sm mb-3">
                                    Selecciona un paciente para crear un caso clínico con esta plantilla:
                                </p>
                                <div className="flex gap-3 items-end">
                                    <div className="flex-1">
                                        <PacienteSelect
                                            value={nuevoPacienteId}
                                            onChange={(id) => setNuevoPacienteId(id)}
                                        />
                                    </div>
                                    <button
                                        onClick={handleCrearCaso}
                                        disabled={!nuevoPacienteId || isProcessing}
                                        className="px-4 py-2 bg-aqua text-white rounded-md hover:bg-blue-600 font-worksans disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Creando...' : 'Crear Caso'}
                                    </button>
                                    <button
                                        onClick={() => { setShowCasoForm(false); setNuevoPacienteId(undefined); }}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-worksans"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}

                        {casosLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aqua"></div>
                                <span className="ml-3 text-gray-600 font-worksans">Cargando casos...</span>
                            </div>
                        ) : casos.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-worksans text-lg">No hay casos clínicos asignados.</p>
                                <p className="text-gray-400 font-worksans text-sm mt-2">
                                    Asigna esta plantilla a un paciente para crear un caso clínico.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {casos.map((caso) => (
                                    <div key={caso.id} className="border border-gray-200 rounded-lg p-4 hover:border-aqua transition-colors">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                    {caso.paciente_detail ? `${caso.paciente_detail.nombre.charAt(0)}${caso.paciente_detail.apellido.charAt(0)}` : '?'}
                                                </div>
                                                <div>
                                                    {caso.paciente_detail ? (
                                                        <>
                                                            <Link
                                                                to={`/pacientes/${caso.paciente_detail.id}`}
                                                                className="font-medium text-gray-900 hover:text-aqua font-worksans"
                                                            >
                                                                {caso.paciente_detail.nombre} {caso.paciente_detail.apellido}
                                                            </Link>
                                                            <p className="text-sm text-gray-500 font-worksans">{formatRut(caso.paciente_detail.rut)}</p>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-500 font-worksans">Paciente #{caso.paciente}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-sm font-worksans">
                                                    <Users className="w-4 h-4" /> {caso.total_estudiantes} estudiante(s)
                                                </span>
                                                <span className="text-xs text-gray-400 font-worksans">
                                                    {new Date(caso.fecha_creacion).toLocaleDateString()}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteCaso(caso.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Eliminar caso"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: Fichas de Estudiantes */}
                {activeTab === 'estudiantes' && isDocente && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        <div className="flex items-center mb-6">
                            <Users className="w-6 h-6 mr-3 text-aqua" />
                            <h2 className="text-2xl font-worksans font-semibold">Fichas de Estudiantes</h2>
                        </div>

                        {estudiantesLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aqua"></div>
                                <span className="ml-3 text-gray-600 font-worksans">Cargando fichas de estudiantes...</span>
                            </div>
                        ) : (() => {
                            const allFichas = Array.from(fichasEstudiantes.values()).flat();
                            if (allFichas.length === 0) {
                                return (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 font-worksans text-lg">Ningún estudiante ha creado su ficha aún.</p>
                                    </div>
                                );
                            }
                            return (
                                <div className="space-y-6">
                                    {casos.map((caso) => {
                                        const fichas = fichasEstudiantes.get(caso.id) || [];
                                        if (fichas.length === 0) return null;
                                        return (
                                            <div key={caso.id}>
                                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider font-worksans mb-3">
                                                    Paciente: {caso.paciente_detail ? `${caso.paciente_detail.nombre} ${caso.paciente_detail.apellido}` : `#${caso.paciente}`}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {fichas.map((fichaEst) => (
                                                        <Link
                                                            key={fichaEst.id}
                                                            to={`/fichas/estudiante/${fichaEst.id}`}
                                                            className="block border border-gray-200 rounded-lg p-4 hover:border-aqua hover:shadow-md transition-all"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                                            <span className="text-green-700 font-semibold text-sm">
                                                                                {fichaEst.estudiante_nombre?.charAt(0) || '?'}
                                                                            </span>
                                                                        </div>
                                                                        <span className="font-semibold text-gray-900 font-worksans">
                                                                            {fichaEst.estudiante_nombre || 'Estudiante'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500 font-worksans">
                                                                        Creada: {new Date(fichaEst.fecha_creacion).toLocaleDateString()}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 font-worksans">
                                                                        Modificada: {new Date(fichaEst.fecha_modificacion).toLocaleDateString()}
                                                                    </p>
                                                                    {fichaEst.total_versiones > 0 && (
                                                                        <span className="inline-block mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                                            {fichaEst.total_versiones} {fichaEst.total_versiones === 1 ? 'versión' : 'versiones'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <FileText className="w-5 h-5 text-gray-400" />
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2 font-worksans">Eliminar Plantilla</h3>
                            <p className="text-sm text-gray-500 font-worksans mb-6">
                                ¿Estás seguro de que deseas eliminar esta plantilla? Se eliminarán todos los casos clínicos y fichas asociadas.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 font-worksans"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isProcessing}
                                className={`px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 font-worksans ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isProcessing ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FichaDetailPage;
