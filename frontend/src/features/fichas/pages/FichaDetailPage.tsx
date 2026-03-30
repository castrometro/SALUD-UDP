import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Stethoscope, Plus, BookOpen, Trash2, Users } from 'lucide-react';
import { CasoClinico, AtencionClinica } from '../types';
import {
    getCasoClinico, deleteCasoClinico,
    getAtencionesDeCaso, deleteAtencionClinica
} from '../services/fichaService';
import { useAuth } from '../../auth/context/AuthContext';
import { formatRut } from '@/utils/rut';
import Toast from '@/components/ui/Toast';

type TabType = 'descripcion' | 'atenciones';

const FichaDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [caso, setCaso] = useState<CasoClinico | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [activeTab, setActiveTab] = useState<TabType>('descripcion');

    // Atenciones clínicas
    const [atenciones, setAtenciones] = useState<AtencionClinica[]>([]);
    const [atencionesLoading, setAtencionesLoading] = useState(false);
    const [atencionesLoaded, setAtencionesLoaded] = useState(false);

    // Toast
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const isDocente = user?.role === 'ADMIN' || user?.role === 'DOCENTE';

    useEffect(() => {
        if (id) {
            loadCaso(parseInt(id));
        }
    }, [id]);

    const loadCaso = async (casoId: number) => {
        try {
            const data = await getCasoClinico(casoId);
            setCaso(data);
        } catch (error) {
            console.error('Error loading caso clinico', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAtenciones = async () => {
        if (!id || atencionesLoaded) return;
        setAtencionesLoading(true);
        try {
            const data = await getAtencionesDeCaso(parseInt(id), 1, 1000);
            setAtenciones(data.results);
            setAtencionesLoaded(true);
        } catch (error) {
            console.error('Error loading atenciones', error);
        } finally {
            setAtencionesLoading(false);
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        if (tab === 'atenciones' && !atencionesLoaded) {
            loadAtenciones();
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        setIsProcessing(true);
        try {
            await deleteCasoClinico(parseInt(id));
            navigate('/casos-clinicos');
        } catch (error: any) {
            console.error('Error deleting caso clinico', error);
            const msg = error.response?.data?.detail || 'Error al eliminar el caso clinico';
            setToast({ message: msg, type: 'error' });
        } finally {
            setIsProcessing(false);
            setShowDeleteModal(false);
        }
    };

    const handleDeleteAtencion = async (atencion: AtencionClinica) => {
        if (!window.confirm('Estas seguro de eliminar esta atencion clinica?')) return;
        try {
            await deleteAtencionClinica(atencion.id);
            setToast({ message: 'Atencion eliminada exitosamente', type: 'success' });
            setAtencionesLoaded(false);
            loadAtenciones();
        } catch (error: any) {
            const msg = error.response?.data?.detail || 'Error al eliminar la atencion';
            setToast({ message: msg, type: 'error' });
        }
    };

    if (loading) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aqua mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-worksans">Cargando caso clinico...</p>
                </div>
            </div>
        );
    }

    if (!caso) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Caso clinico no encontrado</h2>
                    <p className="text-gray-600 mb-4">El caso clinico que buscas no existe o fue eliminado.</p>
                    <Link to="/casos-clinicos" className="text-aqua hover:text-blue-600 font-medium">
                        Volver a Casos Clinicos
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
                    <Link to="/casos-clinicos" className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Casos Clinicos
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
                                    Caso Clinico
                                </span>
                                <span className="text-sm text-gray-500 font-worksans">
                                    {caso.total_atenciones} atencion(es)
                                </span>
                            </div>
                            <h1 className="text-4xl font-arizona font-medium text-gray-900 mb-2">
                                {caso.titulo}
                            </h1>
                            {caso.tema && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold font-worksans">
                                    {caso.tema}
                                </span>
                            )}
                            <p className="text-sm text-gray-500 font-worksans mt-2">
                                Creado por {caso.creado_por_nombre || 'Desconocido'} el {new Date(caso.fecha_creacion).toLocaleDateString()}
                                {caso.modificado_por_nombre && (
                                    <> &middot; Modificado por {caso.modificado_por_nombre}</>
                                )}
                            </p>
                        </div>
                        <div className="flex gap-2">
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
                                Descripcion del Caso
                            </button>

                            <button
                                onClick={() => handleTabChange('atenciones')}
                                className={`group inline-flex items-center py-4 px-1 border-b-2 font-worksans font-medium text-sm ${activeTab === 'atenciones' ? 'border-aqua text-aqua' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <Stethoscope className={`mr-2 h-5 w-5 ${activeTab === 'atenciones' ? 'text-aqua' : 'text-gray-400'}`} />
                                Atenciones Clinicas
                                {atencionesLoaded && atenciones.length > 0 && (
                                    <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-blue-100 text-blue-800">{atenciones.length}</span>
                                )}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* TAB: Descripcion del Caso */}
                {activeTab === 'descripcion' && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-worksans font-semibold mb-4">Descripcion del Caso</h2>
                        <div className="w-full border rounded-md p-4 bg-gray-50 border-gray-200 min-h-[120px] font-worksans text-sm whitespace-pre-wrap leading-relaxed">
                            {caso.descripcion || <span className="text-gray-400 italic">Sin descripcion</span>}
                        </div>
                    </div>
                )}

                {/* TAB: Atenciones Clinicas */}
                {activeTab === 'atenciones' && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Stethoscope className="w-6 h-6 mr-3 text-aqua" />
                                <h2 className="text-2xl font-worksans font-semibold">Atenciones Clinicas</h2>
                            </div>
                            {isDocente && (
                                <Link
                                    to={`/casos-clinicos/${caso.id}/nueva-atencion`}
                                    className="inline-flex items-center px-3 py-2 bg-aqua text-white rounded-md hover:bg-blue-600 font-worksans text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Nueva Atencion
                                </Link>
                            )}
                        </div>

                        {atencionesLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aqua"></div>
                                <span className="ml-3 text-gray-600 font-worksans">Cargando atenciones...</span>
                            </div>
                        ) : atenciones.length === 0 ? (
                            <div className="text-center py-12">
                                <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-worksans text-lg">No hay atenciones clinicas registradas.</p>
                                {isDocente && (
                                    <Link
                                        to={`/casos-clinicos/${caso.id}/nueva-atencion`}
                                        className="text-aqua hover:text-blue-600 font-worksans text-sm font-medium mt-2 inline-block"
                                    >
                                        Crear la primera atencion
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {atenciones.map((atencion) => (
                                    <div
                                        key={atencion.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-aqua hover:shadow-md transition-all"
                                    >
                                        <Link to={`/atenciones/${atencion.id}`} className="block">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    {atencion.paciente_detail && (
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <span className="text-blue-700 font-semibold text-sm">
                                                                    {atencion.paciente_detail.nombre.charAt(0)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="font-semibold text-gray-900 font-worksans text-sm">
                                                                    {atencion.paciente_detail.nombre} {atencion.paciente_detail.apellido}
                                                                </span>
                                                                <p className="text-xs text-gray-500 font-worksans">
                                                                    {formatRut(atencion.paciente_detail.rut)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-gray-600 font-worksans">
                                                        Fecha: {new Date(atencion.fecha_atencion).toLocaleDateString('es-CL')}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                                                            <Users className="w-3 h-3" />
                                                            {atencion.total_estudiantes} estudiante(s)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                        {isDocente && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                                                <button
                                                    onClick={() => handleDeleteAtencion(atencion)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Eliminar atencion"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2 font-worksans">Eliminar Caso Clinico</h3>
                            <p className="text-sm text-gray-500 font-worksans mb-6">
                                Estas seguro de que deseas eliminar este caso clinico? Se eliminaran todas las atenciones asociadas.
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
