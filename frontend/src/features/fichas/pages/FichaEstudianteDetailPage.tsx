import { useState, useEffect, type ChangeEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, History, FileText, Eye, RotateCcw } from 'lucide-react';
import { FichaEstudiante, FichaHistorial, CasoClinico } from '../types';
import {
    getFichaEstudiante, updateFichaEstudiante, deleteFichaEstudiante,
    getFichaHistorial, getCasoClinico
} from '../services/fichaService';
import { useAuth } from '../../auth/context/AuthContext';

type TabType = 'caso' | 'historial';

const FichaEstudianteDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ficha, setFicha] = useState<FichaEstudiante | null>(null);
    const [editableFicha, setEditableFicha] = useState<FichaEstudiante | null>(null);
    const [caso, setCaso] = useState<CasoClinico | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [activeTab, setActiveTab] = useState<TabType>('caso');

    const [historial, setHistorial] = useState<FichaHistorial[]>([]);
    const [historialLoading, setHistorialLoading] = useState(false);
    const [historialLoaded, setHistorialLoaded] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState<FichaHistorial | null>(null);

    const isDocente = user?.role === 'ADMIN' || user?.role === 'DOCENTE';
    const isOwner = ficha?.estudiante === user?.id;
    const canEdit = isDocente || isOwner;
    const canDelete = isDocente;

    useEffect(() => {
        if (id) {
            loadFicha(parseInt(id));
        }
    }, [id]);

    const loadFicha = async (fichaId: number) => {
        try {
            const data = await getFichaEstudiante(fichaId);
            setFicha(data);
            setEditableFicha(data);
            // Cargar info del caso clínico
            if (data.caso_clinico) {
                const casoData = await getCasoClinico(data.caso_clinico);
                setCaso(casoData);
            }
        } catch (error) {
            console.error('Error loading ficha', error);
        } finally {
            setLoading(false);
        }
    };

    const loadHistorial = async () => {
        if (!id || historialLoaded) return;
        setHistorialLoading(true);
        try {
            const data = await getFichaHistorial(parseInt(id));
            setHistorial(data);
            setHistorialLoaded(true);
        } catch (error) {
            console.error('Error loading historial', error);
        } finally {
            setHistorialLoading(false);
        }
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        if (tab === 'historial' && !historialLoaded) {
            loadHistorial();
        }
    };

    const handleSelectVersion = (version: FichaHistorial) => {
        setSelectedVersion(version);
        setActiveTab('caso');
    };

    const handleClearVersion = () => {
        setSelectedVersion(null);
    };

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditableFicha(prev => prev ? {
            ...prev,
            contenido: { ...prev.contenido, [name]: value },
        } : null);
    };

    const handleSave = async () => {
        if (!id || !editableFicha) return;
        setIsProcessing(true);
        setError(null);
        try {
            const updated = await updateFichaEstudiante(parseInt(id), { contenido: editableFicha.contenido });
            setFicha(updated);
            setEditableFicha(updated);
            setIsEditing(false);
            setHistorialLoaded(false); // Refresh historial on next visit
        } catch (err) {
            console.error('Error saving ficha', err);
            setError('No se pudo guardar la ficha. Inténtelo nuevamente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDiscard = () => {
        setEditableFicha(ficha);
        setIsEditing(false);
        setError(null);
    };

    const handleDelete = async () => {
        if (!id) return;
        setIsProcessing(true);
        try {
            await deleteFichaEstudiante(parseInt(id));
            navigate('/plantillas');
        } catch (error: any) {
            console.error('Error deleting ficha', error);
            const msg = error.response?.data?.detail || 'Error al eliminar la ficha';
            alert(msg);
        } finally {
            setIsProcessing(false);
            setShowDeleteModal(false);
        }
    };

    const formatDateTime = (dateTime?: string) => {
        if (!dateTime) return { date: "Desconocido", time: "" };
        const d = new Date(dateTime);
        return { date: d.toLocaleDateString(), time: d.toLocaleTimeString() };
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
                    <p className="mt-4 text-gray-600 font-worksans">Cargando ficha...</p>
                </div>
            </div>
        );
    }

    if (!ficha || !editableFicha) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Ficha no encontrada</h2>
                    <p className="text-gray-600 mb-4">La ficha que buscas no existe o fue eliminada.</p>
                    <Link to="/plantillas" className="text-aqua hover:text-blue-600 font-medium">
                        Volver a Plantillas
                    </Link>
                </div>
            </div>
        );
    }

    const paciente = caso?.paciente_detail;
    const created = formatDateTime(ficha.fecha_creacion);
    const modified = formatDateTime(ficha.fecha_modificacion);

    return (
        <div className="bg-beige pb-12">
            {/* Top Navigation */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex gap-4">
                    {caso && (
                        <Link
                            to={`/plantillas/${caso.plantilla}`}
                            className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            {caso.plantilla_titulo}
                        </Link>
                    )}
                    {paciente && (
                        <Link
                            to={`/pacientes/${paciente.id}`}
                            className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Paciente
                        </Link>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    {paciente && (
                        <>
                            <h1 className="text-4xl mb-2">
                                <span className="font-arizona font-medium">Ficha del paciente:</span>{' '}
                                <span className="font-arizona font-light">{paciente.nombre} {paciente.apellido}</span>
                            </h1>
                            <p className="text-4xl font-arizona text-gray-600 mb-4">
                                <span className="font-medium">RUT:</span>
                                <span className="font-light"> {paciente.rut}</span>
                            </p>
                        </>
                    )}
                    <div className="flex flex-wrap gap-2 items-center mb-4">
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold font-worksans">
                            Ficha de Estudiante: {ficha.estudiante_nombre}
                        </span>
                        {caso && (
                            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-worksans">
                                Plantilla: {caso.plantilla_titulo}
                            </span>
                        )}
                    </div>
                    <hr className="border-black" />
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => handleTabChange('caso')}
                                className={`group inline-flex items-center py-4 px-1 border-b-2 font-worksans font-medium text-sm ${activeTab === 'caso' ? 'border-aqua text-aqua' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <FileText className={`mr-2 h-5 w-5 ${activeTab === 'caso' ? 'text-aqua' : 'text-gray-400'}`} />
                                Caso Clínico
                            </button>
                            <button
                                onClick={() => handleTabChange('historial')}
                                className={`group inline-flex items-center py-4 px-1 border-b-2 font-worksans font-medium text-sm ${activeTab === 'historial' ? 'border-aqua text-aqua' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                <History className={`mr-2 h-5 w-5 ${activeTab === 'historial' ? 'text-aqua' : 'text-gray-400'}`} />
                                Historial
                                {historialLoaded && historial.length > 0 && (
                                    <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-blue-100 text-blue-800">{historial.length}</span>
                                )}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* TAB: Caso Clínico */}
                {activeTab === 'caso' && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        {selectedVersion && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <History className="w-5 h-5 text-amber-600 mr-2" />
                                        <div>
                                            <span className="font-semibold text-amber-800 font-worksans">Visualizando Versión {selectedVersion.version}</span>
                                            <p className="text-sm text-amber-600 font-worksans">
                                                Modificado por {selectedVersion.autor_nombre || 'Desconocido'} el {new Date(selectedVersion.fecha).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClearVersion}
                                        className="inline-flex items-center px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 font-worksans text-sm"
                                    >
                                        <RotateCcw className="w-4 h-4 mr-1" />
                                        Ver versión actual
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-worksans font-semibold">
                                Detalles de la Atención
                                {selectedVersion && (
                                    <span className="ml-2 text-base font-normal text-amber-600">(Versión {selectedVersion.version})</span>
                                )}
                            </h2>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="mb-6 font-worksans">
                                {selectedVersion ? (
                                    <>
                                        <p><span className="font-semibold">Versión:</span> {selectedVersion.version}</p>
                                        <p><span className="font-semibold">Modificado por:</span> {selectedVersion.autor_nombre || "Desconocido"}</p>
                                        <p><span className="font-semibold">Fecha:</span> {new Date(selectedVersion.fecha).toLocaleDateString()}</p>
                                    </>
                                ) : (
                                    <>
                                        <p><span className="font-semibold">Creado por:</span> {ficha.creado_por_nombre || "Desconocido"}</p>
                                        <p><span className="font-semibold">Fecha:</span> {created.date} - {created.time}</p>
                                        <p className="mt-2"><span className="font-semibold">Última Modificación:</span> {ficha.modificado_por_nombre || "Desconocido"}</p>
                                        <p><span className="font-semibold">Fecha:</span> {modified.date} - {modified.time}</p>
                                    </>
                                )}
                            </div>

                            <h3 className="text-2xl font-worksans font-semibold mt-4">Valoración</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {valoracionFields.map((field, index) => (
                                    <div key={index} className="col-span-1">
                                        <label className="text-lg font-worksans font-semibold block mb-1">{field.label}</label>
                                        <textarea
                                            name={field.name}
                                            value={selectedVersion
                                                ? (selectedVersion.contenido[field.name] || '')
                                                : (editableFicha.contenido[field.name] || '')
                                            }
                                            onChange={handleInputChange}
                                            readOnly={!isEditing || !!selectedVersion}
                                            className={`w-full border rounded-md p-2 ${selectedVersion
                                                ? 'bg-amber-50 border-amber-200'
                                                : isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-gray-200'
                                            } resize-none font-worksans`}
                                            rows={3}
                                        />
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-2xl font-worksans font-semibold mt-4">Diagnóstico</h3>
                            <textarea
                                name="diagnostico"
                                value={selectedVersion
                                    ? (selectedVersion.contenido.diagnostico || '')
                                    : (editableFicha.contenido.diagnostico || '')
                                }
                                onChange={handleInputChange}
                                readOnly={!isEditing || !!selectedVersion}
                                className={`w-full border rounded-md p-2 ${selectedVersion
                                    ? 'bg-amber-50 border-amber-200'
                                    : isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-gray-200'
                                } resize-none font-worksans`}
                                rows={3}
                            />

                            <h3 className="text-2xl font-worksans font-semibold mt-4">Intervenciones</h3>
                            <textarea
                                name="intervenciones"
                                value={selectedVersion
                                    ? (selectedVersion.contenido.intervenciones || '')
                                    : (editableFicha.contenido.intervenciones || '')
                                }
                                onChange={handleInputChange}
                                readOnly={!isEditing || !!selectedVersion}
                                className={`w-full border rounded-md p-2 ${selectedVersion
                                    ? 'bg-amber-50 border-amber-200'
                                    : isEditing ? 'bg-white border-gray-300' : 'bg-gray-100 border-gray-200'
                                } resize-none font-worksans`}
                                rows={3}
                            />

                            {!selectedVersion && (
                                <div className="flex justify-between mt-6">
                                    {canEdit && (
                                        <>
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={isProcessing}
                                                        className={`bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 font-worksans ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {isProcessing ? 'Guardando...' : 'Guardar'}
                                                    </button>
                                                    <button
                                                        onClick={handleDiscard}
                                                        disabled={isProcessing}
                                                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-worksans"
                                                    >
                                                        Descartar
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="bg-aqua text-white px-4 py-2 rounded-md hover:bg-blue-700 font-worksans"
                                                >
                                                    Editar
                                                </button>
                                            )}
                                        </>
                                    )}
                                    {canDelete && (
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            disabled={isProcessing}
                                            className={`bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 font-worksans ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: Historial */}
                {activeTab === 'historial' && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        <div className="flex items-center mb-6">
                            <History className="w-6 h-6 mr-3 text-aqua" />
                            <h2 className="text-2xl font-worksans font-semibold">Historial de Cambios</h2>
                        </div>

                        {historialLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aqua"></div>
                                <span className="ml-3 text-gray-600 font-worksans">Cargando historial...</span>
                            </div>
                        ) : historial.length === 0 ? (
                            <div className="text-center py-12">
                                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-worksans text-lg">No hay versiones anteriores.</p>
                                <p className="text-gray-400 font-worksans text-sm mt-2">
                                    El historial se genera cada vez que se guarda un cambio.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Versión Actual */}
                                <div className={`border rounded-lg p-4 ${!selectedVersion ? 'border-aqua bg-blue-50' : 'border-gray-200 bg-white'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`font-semibold ${!selectedVersion ? 'text-aqua' : 'text-gray-700'}`}>
                                                    Versión Actual
                                                </span>
                                                {!selectedVersion && <span className="px-2 py-0.5 bg-aqua text-white text-xs rounded-full">Visualizando</span>}
                                            </div>
                                            <p className="text-sm text-gray-600 font-worksans">
                                                Modificado por: {ficha.modificado_por_nombre || 'Desconocido'}
                                            </p>
                                            <p className="text-sm text-gray-500 font-worksans">
                                                {new Date(ficha.fecha_modificacion).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleClearVersion}
                                            disabled={!selectedVersion}
                                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-worksans ${!selectedVersion ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-aqua hover:text-white'}`}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            {!selectedVersion ? 'Seleccionada' : 'Visualizar'}
                                        </button>
                                    </div>
                                </div>

                                {historial.map((version) => (
                                    <div
                                        key={version.id}
                                        className={`border rounded-lg p-4 ${selectedVersion?.id === version.id ? 'border-aqua bg-blue-50' : 'border-gray-200 bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`font-semibold ${selectedVersion?.id === version.id ? 'text-aqua' : 'text-gray-700'}`}>
                                                        Versión {version.version}
                                                    </span>
                                                    {selectedVersion?.id === version.id && <span className="px-2 py-0.5 bg-aqua text-white text-xs rounded-full">Visualizando</span>}
                                                </div>
                                                <p className="text-sm text-gray-600 font-worksans">
                                                    Modificado por: {version.autor_nombre || 'Desconocido'}
                                                </p>
                                                <p className="text-sm text-gray-500 font-worksans">
                                                    {new Date(version.fecha).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleSelectVersion(version)}
                                                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-worksans ${selectedVersion?.id === version.id ? 'bg-amber-200 text-amber-800' : 'bg-gray-100 text-gray-700 hover:bg-aqua hover:text-white'}`}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                {selectedVersion?.id === version.id ? 'Seleccionada' : 'Visualizar'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2 font-worksans">Eliminar Ficha de Estudiante</h3>
                            <p className="text-sm text-gray-500 font-worksans mb-6">
                                ¿Estás seguro? Esta acción no se puede deshacer.
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

export default FichaEstudianteDetailPage;
