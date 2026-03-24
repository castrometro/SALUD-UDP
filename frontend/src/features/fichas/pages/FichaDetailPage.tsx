import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Users, FileText, BookOpen } from 'lucide-react';
import { CasoClinico, FichaEstudiante } from '../types';
import {
    getCasoClinico, deleteCasoClinico,
    getFichasEstudiantesDeCaso, crearMiFicha, getMiFicha
} from '../services/fichaService';
import { useAuth } from '../../auth/context/AuthContext';
import { formatRut } from '@/utils/rut';
import Toast from '@/components/ui/Toast';

type TabType = 'descripcion' | 'estudiantes';

const FichaDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [caso, setCaso] = useState<CasoClinico | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [activeTab, setActiveTab] = useState<TabType>('descripcion');

    // Fichas de estudiantes
    const [fichasEstudiantes, setFichasEstudiantes] = useState<FichaEstudiante[]>([]);
    const [estudiantesLoading, setEstudiantesLoading] = useState(false);
    const [estudiantesLoaded, setEstudiantesLoaded] = useState(false);

    // Mi ficha (para estudiantes)
    const [miFicha, setMiFicha] = useState<FichaEstudiante | null | undefined>(undefined);
    const [miFichaLoading, setMiFichaLoading] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const isDocente = user?.role === 'ADMIN' || user?.role === 'DOCENTE';
    const isEstudiante = user?.role === 'ESTUDIANTE';

    useEffect(() => {
        if (id) {
            loadCaso(parseInt(id));
        }
    }, [id]);

    useEffect(() => {
        if (caso && isEstudiante) {
            loadMiFicha();
        }
    }, [caso, isEstudiante]);

    const loadCaso = async (casoId: number) => {
        try {
            const data = await getCasoClinico(casoId);
            setCaso(data);
        } catch (error) {
            console.error('Error loading caso clínico', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMiFicha = async () => {
        if (!id) return;
        setMiFichaLoading(true);
        try {
            const ficha = await getMiFicha(parseInt(id));
            setMiFicha(ficha);
        } catch (error) {
            console.error('Error loading mi ficha', error);
            setMiFicha(null);
        } finally {
            setMiFichaLoading(false);
        }
    };

    const loadFichasEstudiantes = async () => {
        if (!id || estudiantesLoaded) return;
        setEstudiantesLoading(true);
        try {
            const data = await getFichasEstudiantesDeCaso(parseInt(id), 1, 1000);
            setFichasEstudiantes(data.results);
            setEstudiantesLoaded(true);
        } catch (error) {
            console.error('Error loading fichas estudiantes', error);
        } finally {
            setEstudiantesLoading(false);
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        if (tab === 'estudiantes' && !estudiantesLoaded) {
            loadFichasEstudiantes();
        }
    };

    const handleCrearMiFicha = async () => {
        if (!id) return;
        setIsProcessing(true);
        try {
            const ficha = await crearMiFicha(parseInt(id));
            setToast({ message: 'Tu ficha ha sido creada exitosamente', type: 'success' });
            setTimeout(() => navigate(`/fichas/estudiante/${ficha.id}`), 1200);
        } catch (error: any) {
            console.error('Error creating ficha', error);
            const msg = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Error al crear la ficha';
            setToast({ message: msg, type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setIsProcessing(true);
        try {
            await deleteCasoClinico(parseInt(id));
            navigate('/casos-clinicos');
        } catch (error: any) {
            console.error('Error deleting caso clínico', error);
            const msg = error.response?.data?.detail || 'Error al eliminar el caso clínico';
            setToast({ message: msg, type: 'error' });
        } finally {
            setIsProcessing(false);
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aqua mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-worksans">Cargando caso clínico...</p>
                </div>
            </div>
        );
    }

    if (!caso) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Caso clínico no encontrado</h2>
                    <p className="text-gray-600 mb-4">El caso clínico que buscas no existe o fue eliminado.</p>
                    <Link to="/casos-clinicos" className="text-aqua hover:text-blue-600 font-medium">
                        Volver a Casos Clínicos
                    </Link>
                </div>
            </div>
        );
    }

    const paciente = caso.paciente_detail;

    return (
        <div className="bg-beige pb-12">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {/* Top Navigation */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/casos-clinicos" className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Casos Clínicos
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
                                    Caso Clínico
                                </span>
                                <span className="text-sm text-gray-500 font-worksans">
                                    {caso.total_estudiantes} estudiante(s)
                                </span>
                            </div>
                            <h1 className="text-4xl font-arizona font-medium text-gray-900 mb-2">
                                {caso.titulo}
                            </h1>
                            {paciente && (
                                <p className="text-gray-600 font-worksans">
                                    Paciente:{' '}
                                    <Link to={`/pacientes/${paciente.id}`} className="text-aqua hover:text-blue-600">
                                        {paciente.nombre} {paciente.apellido}
                                    </Link>
                                    {' '}({formatRut(paciente.rut)})
                                </p>
                            )}
                            <p className="text-sm text-gray-500 font-worksans mt-2">
                                Creado por {caso.creado_por_nombre || 'Desconocido'} el {new Date(caso.fecha_creacion).toLocaleDateString()}
                                {caso.modificado_por_nombre && (
                                    <> &middot; Modificado por {caso.modificado_por_nombre}</>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {isEstudiante && miFicha === null && !miFichaLoading && (
                                <button
                                    onClick={handleCrearMiFicha}
                                    disabled={isProcessing}
                                    className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-worksans font-medium ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isProcessing ? 'Creando...' : 'Crear mi ficha'}
                                </button>
                            )}
                            {isEstudiante && miFicha && (
                                <Link
                                    to={`/fichas/estudiante/${miFicha.id}`}
                                    className="px-4 py-2 bg-aqua text-white rounded-md hover:bg-blue-600 font-worksans font-medium"
                                >
                                    Ver mi ficha
                                </Link>
                            )}
                            {isDocente && (
                                <>
                                    <Link
                                        to={`/casos-clinicos/${caso.id}/editar`}
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
                                </>
                            )}
                        </div>
                    </div>
                    <hr className="border-black mt-4" />
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => handleTabChange('descripcion')}
                                className={`group inline-flex items-center py-4 px-1 border-b-2 font-worksans font-medium text-sm ${activeTab === 'descripcion' ? 'border-aqua text-aqua' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <BookOpen className={`mr-2 h-5 w-5 ${activeTab === 'descripcion' ? 'text-aqua' : 'text-gray-400'}`} />
                                Descripción del Caso
                            </button>

                            <button
                                onClick={() => handleTabChange('estudiantes')}
                                className={`group inline-flex items-center py-4 px-1 border-b-2 font-worksans font-medium text-sm ${activeTab === 'estudiantes' ? 'border-aqua text-aqua' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <Users className={`mr-2 h-5 w-5 ${activeTab === 'estudiantes' ? 'text-aqua' : 'text-gray-400'}`} />
                                Fichas de Estudiantes
                                {estudiantesLoaded && fichasEstudiantes.length > 0 && (
                                    <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-blue-100 text-blue-800">{fichasEstudiantes.length}</span>
                                )}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* TAB: Descripción del Caso */}
                {activeTab === 'descripcion' && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-worksans font-semibold mb-4">Descripción del Caso</h2>
                        <div className="w-full border rounded-md p-4 bg-gray-50 border-gray-200 min-h-[120px] font-worksans text-sm whitespace-pre-wrap leading-relaxed">
                            {caso.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                        </div>
                    </div>
                )}

                {/* TAB: Fichas de Estudiantes */}
                {activeTab === 'estudiantes' && (
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
                        ) : fichasEstudiantes.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-worksans text-lg">Ningún estudiante ha creado su ficha aún.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {fichasEstudiantes.map((fichaEst) => (
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
                        )}
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2 font-worksans">Eliminar Caso Clínico</h3>
                            <p className="text-sm text-gray-500 font-worksans mb-6">
                                ¿Estás seguro de que deseas eliminar este caso clínico? Se eliminarán todas las fichas de estudiantes asociadas.
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
