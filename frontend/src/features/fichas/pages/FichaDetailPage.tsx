import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, History, Users, FileText, Copy, ClipboardList, Eye, RotateCcw } from 'lucide-react';
import { FichaAmbulatoria, FichaHistorial } from '../types';
import {
    getFicha, deleteFicha, updateFicha,
    getFichaHistorial, crearMiFicha, getFichasEstudiantes
} from '../services/fichaService';
import { useAuth } from '../../auth/context/AuthContext';

type TabType = 'caso' | 'historial' | 'estudiantes';

const FichaDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ficha, setFicha] = useState<FichaAmbulatoria | null>(null);
    const [editableFicha, setEditableFicha] = useState<FichaAmbulatoria | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Estado de pestaña activa
    const [activeTab, setActiveTab] = useState<TabType>('caso');

    // Estados para historial y fichas de estudiantes
    const [historial, setHistorial] = useState<FichaHistorial[]>([]);
    const [historialLoading, setHistorialLoading] = useState(false);
    const [historialLoaded, setHistorialLoaded] = useState(false);
    const [fichasEstudiantes, setFichasEstudiantes] = useState<FichaAmbulatoria[]>([]);
    const [estudiantesLoading, setEstudiantesLoading] = useState(false);
    const [estudiantesLoaded, setEstudiantesLoaded] = useState(false);

    // Estado para versión seleccionada del historial
    const [selectedVersion, setSelectedVersion] = useState<FichaHistorial | null>(null);

    const isDocente = user?.role === 'ADMIN' || user?.role === 'DOCENTE';

    useEffect(() => {
        if (id) {
            loadFicha(parseInt(id));
        }
    }, [id]);

    const loadFicha = async (fichaId: number) => {
        try {
            const data = await getFicha(fichaId);
            setFicha(data);
            setEditableFicha(data);
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

    const loadFichasEstudiantes = async () => {
        if (!id || estudiantesLoaded) return;
        setEstudiantesLoading(true);
        try {
            const data = await getFichasEstudiantes(parseInt(id));
            setFichasEstudiantes(data);
            setEstudiantesLoaded(true);
        } catch (error) {
            console.error('Error loading fichas estudiantes', error);
        } finally {
            setEstudiantesLoading(false);
        }
    };

    // Cargar datos cuando se cambia de pestaña
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        if (tab === 'historial' && !historialLoaded) {
            loadHistorial();
        } else if (tab === 'estudiantes' && !estudiantesLoaded) {
            loadFichasEstudiantes();
        }
    };

    // Seleccionar una versión del historial para visualizar
    const handleSelectVersion = (version: FichaHistorial) => {
        setSelectedVersion(version);
        setActiveTab('caso');
    };

    // Volver a la versión actual
    const handleClearVersion = () => {
        setSelectedVersion(null);
    };

    const handleCrearMiFicha = async () => {
        if (!id) return;
        setIsProcessing(true);
        try {
            const nuevaFicha = await crearMiFicha(parseInt(id));
            alert('Tu ficha ha sido creada. Ahora puedes editarla.');
            navigate(`/fichas/${nuevaFicha.id}`);
        } catch (error: any) {
            console.error('Error creating ficha', error);
            alert(error.response?.data?.error || 'Error al crear la ficha');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditableFicha(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setError(null);
    };

    const handleSave = async () => {
        if (!id || !editableFicha) return;
        setIsProcessing(true);
        setError(null);

        try {
            await updateFicha(parseInt(id), editableFicha);
            setFicha(editableFicha);
            setIsEditing(false);
            alert('Ficha actualizada correctamente.');
        } catch (err) {
            console.error('Error al actualizar la ficha:', err);
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
            await deleteFicha(parseInt(id));
            alert('Ficha eliminada correctamente.');
            navigate('/fichas');
        } catch (error) {
            console.error('Error deleting ficha', error);
            alert('Error al eliminar la ficha');
        } finally {
            setIsProcessing(false);
            setShowDeleteModal(false);
        }
    };

    const formatDateTime = (dateTime?: string) => {
        if (!dateTime) return { date: "Desconocido", time: "" };
        const date = new Date(dateTime);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString(),
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-beige flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aqua mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-worksans">Cargando ficha...</p>
                </div>
            </div>
        );
    }

    if (!ficha || !editableFicha) {
        return (
            <div className="min-h-screen bg-beige flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Ficha no encontrada</h2>
                    <p className="text-gray-600 mb-4">La ficha que buscas no existe o fue eliminada.</p>
                    <Link
                        to="/fichas"
                        className="text-aqua hover:text-blue-600 font-medium"
                    >
                        Volver a la lista de fichas
                    </Link>
                </div>
            </div>
        );
    }

    const paciente = ficha.paciente_detail;
    const created = formatDateTime(ficha.fecha_creacion);
    const modified = formatDateTime(ficha.fecha_modificacion);

    // Determinar si el usuario puede editar esta ficha
    const canEdit = isDocente || (!ficha.es_plantilla && ficha.estudiante === user?.id);
    const canDelete = isDocente;

    // Campos de valoración (grid 2 columnas)
    const valoracionFields = [
        { label: "Factores", name: "factores" },
        { label: "Anamnesis", name: "anamnesis" },
        { label: "Motivo Consulta", name: "motivo_consulta" },
        { label: "RAU Necesidades", name: "rau_necesidades" },
        { label: "Examen Físico", name: "examen_fisico" },
        { label: "Instrumentos Aplicados", name: "instrumentos_aplicados" },
    ];

    return (
        <div className="min-h-screen bg-beige pb-12">
            {/* Top Navigation */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        to={paciente ? `/pacientes/${paciente.id}` : '/fichas'}
                        className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        {paciente ? 'Volver al paciente' : 'Volver a fichas'}
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header con info del paciente */}
                {paciente && (
                    <div className="mb-6">
                        <h1 className="text-4xl mb-2">
                            <span className="font-arizona font-medium">Ficha del paciente:</span>{' '}
                            <span className="font-arizona font-light">{paciente.nombre} {paciente.apellido}</span>
                        </h1>
                        <p className="text-4xl font-arizona text-gray-600 mb-6">
                            <span className="font-medium">RUT:</span>
                            <span className="font-light"> {paciente.rut}</span>
                        </p>
                        <hr className="border-black my-4" />
                    </div>
                )}

                {/* Badge de tipo de ficha */}
                <div className="mb-4 flex flex-wrap gap-2 items-center">
                    {ficha.es_plantilla ? (
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-semibold font-worksans">
                            📋 Ficha Base (Caso Clínico)
                        </span>
                    ) : (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold font-worksans">
                            👤 Ficha de Estudiante: {ficha.estudiante_nombre}
                        </span>
                    )}
                </div>

                {/* Botón para crear mi ficha (solo estudiantes viendo plantilla) */}
                {ficha.es_plantilla && !isDocente && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 font-worksans mb-3">
                            Esta es la ficha base del caso clínico. Para trabajar en ella, debes crear tu propia copia.
                        </p>
                        <button
                            onClick={handleCrearMiFicha}
                            disabled={isProcessing}
                            className="inline-flex items-center px-4 py-2 bg-aqua text-white rounded-md hover:bg-blue-700 font-worksans font-medium"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            {isProcessing ? 'Creando...' : 'Crear mi ficha'}
                        </button>
                    </div>
                )}

                {/* Sistema de Pestañas */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            {/* Pestaña Caso Clínico */}
                            <button
                                onClick={() => handleTabChange('caso')}
                                className={`
                                    group inline-flex items-center py-4 px-1 border-b-2 font-worksans font-medium text-sm
                                    ${activeTab === 'caso'
                                        ? 'border-aqua text-aqua'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                `}
                            >
                                <ClipboardList className={`mr-2 h-5 w-5 ${activeTab === 'caso' ? 'text-aqua' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                Caso Clínico
                            </button>

                            {/* Pestaña Historial - solo para docentes */}
                            {isDocente && (
                                <button
                                    onClick={() => handleTabChange('historial')}
                                    className={`
                                        group inline-flex items-center py-4 px-1 border-b-2 font-worksans font-medium text-sm
                                        ${activeTab === 'historial'
                                            ? 'border-aqua text-aqua'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <History className={`mr-2 h-5 w-5 ${activeTab === 'historial' ? 'text-aqua' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                    Historial de Cambios
                                    {historialLoaded && historial.length > 0 && (
                                        <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-blue-100 text-blue-800">
                                            {historial.length}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* Pestaña Fichas de Estudiantes - solo para plantillas y docentes */}
                            {isDocente && ficha.es_plantilla && (
                                <button
                                    onClick={() => handleTabChange('estudiantes')}
                                    className={`
                                        group inline-flex items-center py-4 px-1 border-b-2 font-worksans font-medium text-sm
                                        ${activeTab === 'estudiantes'
                                            ? 'border-aqua text-aqua'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <Users className={`mr-2 h-5 w-5 ${activeTab === 'estudiantes' ? 'text-aqua' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                    Fichas de Estudiantes
                                    {estudiantesLoaded && fichasEstudiantes.length > 0 && (
                                        <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-green-100 text-green-800">
                                            {fichasEstudiantes.length}
                                        </span>
                                    )}
                                </button>
                            )}
                        </nav>
                    </div>
                </div>

                {/* Contenido de las Pestañas */}

                {/* TAB: Caso Clínico */}
                {activeTab === 'caso' && (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                        {/* Banner de versión histórica */}
                        {selectedVersion && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <History className="w-5 h-5 text-amber-600 mr-2" />
                                        <div>
                                            <span className="font-semibold text-amber-800 font-worksans">
                                                Visualizando Versión {selectedVersion.version}
                                            </span>
                                            <p className="text-sm text-amber-600 font-worksans">
                                                Modificado por {selectedVersion.modificado_por_nombre || 'Desconocido'} el {new Date(selectedVersion.fecha).toLocaleString()}
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

                        {/* Header de la card */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-worksans font-semibold">
                                Detalles de la Atención
                                {selectedVersion && (
                                    <span className="ml-2 text-base font-normal text-amber-600">
                                        (Versión {selectedVersion.version})
                                    </span>
                                )}
                            </h2>
                            <Link
                                to={paciente ? `/pacientes/${paciente.id}` : '/fichas'}
                                className="bg-aqua text-white text-lg px-4 py-2 rounded-md hover:bg-blue-700 font-worksans font-normal"
                            >
                                Cerrar
                            </Link>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Información de creación/modificación */}
                            <div className="mb-6 font-worksans">
                                {selectedVersion ? (
                                    <>
                                        <p>
                                            <span className="font-semibold">Versión:</span>
                                            <span className="font-normal"> {selectedVersion.version}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Modificado por:</span>
                                            <span className="font-normal"> {selectedVersion.modificado_por_nombre || "Desconocido"}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Fecha:</span>
                                            <span className="font-normal"> {new Date(selectedVersion.fecha).toLocaleDateString()}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Hora:</span>
                                            <span className="font-normal"> {new Date(selectedVersion.fecha).toLocaleTimeString()}</span>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p>
                                            <span className="font-semibold">Creado por:</span>
                                            <span className="font-normal"> {ficha.creado_por_nombre || "Desconocido"}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Fecha:</span>
                                            <span className="font-normal"> {created.date}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Hora:</span>
                                            <span className="font-normal"> {created.time}</span>
                                        </p>
                                        <p className="mt-4">
                                            <span className="font-semibold">Última Modificación:</span>
                                            <span className="font-normal"> {ficha.creado_por_nombre || "Desconocido"}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Fecha:</span>
                                            <span className="font-normal"> {modified.date}</span>
                                        </p>
                                        <p>
                                            <span className="font-semibold">Hora:</span>
                                            <span className="font-normal"> {modified.time}</span>
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Categoría Valoración */}
                            <h3 className="text-2xl font-worksans font-semibold mt-4">Valoración</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {valoracionFields.map((field, index) => (
                                    <div key={index} className="col-span-1">
                                        <label className="text-lg font-worksans font-semibold block mb-1">
                                            {field.label}
                                        </label>
                                        <textarea
                                            name={field.name}
                                            value={selectedVersion
                                                ? (selectedVersion[field.name as keyof FichaHistorial] as string || '')
                                                : (editableFicha[field.name as keyof FichaAmbulatoria] as string || '')
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

                            {/* Categoría Diagnóstico */}
                            <h3 className="text-2xl font-worksans font-semibold mt-4">Categoría Diagnóstico</h3>
                            <div className="w-full">
                                <label className="text-lg font-worksans font-semibold block mb-1">Diagnóstico</label>
                                <textarea
                                    name="diagnostico"
                                    value={selectedVersion
                                        ? (selectedVersion.diagnostico || '')
                                        : (editableFicha.diagnostico || '')
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

                            {/* Categoría Intervenciones */}
                            <h3 className="text-2xl font-worksans font-semibold mt-4">Categoría Intervenciones</h3>
                            <div className="w-full">
                                <label className="text-lg font-worksans font-semibold block mb-1">Intervenciones</label>
                                <textarea
                                    name="intervenciones"
                                    value={selectedVersion
                                        ? (selectedVersion.intervenciones || '')
                                        : (editableFicha.intervenciones || '')
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

                            {/* Botones de acción - Solo mostrar si no hay versión seleccionada */}
                            {!selectedVersion && (
                                <div className="flex justify-between mt-6">
                                    {canEdit && (
                                        <>
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={isProcessing}
                                                        className={`bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 font-worksans font-normal ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                    >
                                                        {isProcessing ? 'Guardando...' : 'Guardar'}
                                                    </button>
                                                    <button
                                                        onClick={handleDiscard}
                                                        disabled={isProcessing}
                                                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-worksans font-normal"
                                                    >
                                                        Descartar
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={handleEditToggle}
                                                    className="bg-aqua text-white px-4 py-2 rounded-md hover:bg-blue-700 font-worksans font-normal"
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
                                            className={`bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 font-worksans font-normal ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            {isProcessing ? 'Eliminando...' : 'Eliminar'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: Historial de Cambios */}
                {activeTab === 'historial' && isDocente && (
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
                                <p className="text-gray-500 font-worksans text-lg">No hay versiones anteriores registradas.</p>
                                <p className="text-gray-400 font-worksans text-sm mt-2">
                                    El historial se genera cada vez que se guarda un cambio en la ficha.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Versión Actual */}
                                <div
                                    className={`border rounded-lg p-4 ${!selectedVersion
                                        ? 'border-aqua bg-blue-50'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`font-semibold ${!selectedVersion ? 'text-aqua' : 'text-gray-700'}`}>
                                                    Versión Actual (Más reciente)
                                                </span>
                                                {!selectedVersion && (
                                                    <span className="px-2 py-0.5 bg-aqua text-white text-xs rounded-full">
                                                        Visualizando
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 font-worksans">
                                                <span className="font-medium">Modificado por:</span> {ficha.modificado_por_nombre || 'Desconocido'}
                                            </p>
                                            <p className="text-sm text-gray-500 font-worksans">
                                                <span className="font-medium">Última modificación:</span> {new Date(ficha.fecha_modificacion || '').toLocaleString()}
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleClearVersion}
                                            disabled={!selectedVersion}
                                            className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-worksans ${!selectedVersion
                                                ? 'bg-blue-200 text-blue-800'
                                                : 'bg-gray-100 text-gray-700 hover:bg-aqua hover:text-white'
                                                }`}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            {!selectedVersion ? 'Seleccionada' : 'Visualizar'}
                                        </button>
                                    </div>
                                    <details className="mt-3">
                                        <summary className="cursor-pointer text-sm text-aqua hover:text-blue-700 font-worksans">
                                            Ver contenido actual
                                        </summary>
                                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            {ficha.factores && (
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="font-medium">Factores:</span>
                                                    <p className="text-gray-600 truncate">{ficha.factores}</p>
                                                </div>
                                            )}
                                            {ficha.anamnesis && (
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="font-medium">Anamnesis:</span>
                                                    <p className="text-gray-600 truncate">{ficha.anamnesis}</p>
                                                </div>
                                            )}
                                            {ficha.motivo_consulta && (
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="font-medium">Motivo Consulta:</span>
                                                    <p className="text-gray-600 truncate">{ficha.motivo_consulta}</p>
                                                </div>
                                            )}
                                            {ficha.diagnostico && (
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="font-medium">Diagnóstico:</span>
                                                    <p className="text-gray-600 truncate">{ficha.diagnostico}</p>
                                                </div>
                                            )}
                                            {ficha.intervenciones && (
                                                <div className="bg-gray-50 p-2 rounded">
                                                    <span className="font-medium">Intervenciones:</span>
                                                    <p className="text-gray-600 truncate">{ficha.intervenciones}</p>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                </div>

                                {/* Versiones Anteriores */}
                                {historial.map((version, index) => (
                                    <div
                                        key={version.id}
                                        className={`border rounded-lg p-4 ${selectedVersion?.id === version.id
                                                ? 'border-aqua bg-blue-50'
                                                : 'border-gray-200 bg-white'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`font-semibold ${selectedVersion?.id === version.id
                                                            ? 'text-aqua'
                                                            : 'text-gray-700'
                                                        }`}>
                                                        Versión {version.version}
                                                    </span>
                                                    {selectedVersion?.id === version.id && (
                                                        <span className="px-2 py-0.5 bg-aqua text-white text-xs rounded-full">
                                                            Visualizando
                                                        </span>
                                                    )}
                                                    {index === 0 && (
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                            Punto de restauración
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 font-worksans">
                                                    <span className="font-medium">Modificado por:</span> {version.modificado_por_nombre || 'Desconocido'}
                                                </p>
                                                <p className="text-sm text-gray-500 font-worksans">
                                                    <span className="font-medium">Fecha:</span> {new Date(version.fecha).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Botón para visualizar esta versión */}
                                            <button
                                                onClick={() => handleSelectVersion(version)}
                                                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-worksans ${selectedVersion?.id === version.id
                                                    ? 'bg-amber-200 text-amber-800'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-aqua hover:text-white'
                                                    }`}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                {selectedVersion?.id === version.id ? 'Seleccionada' : 'Visualizar'}
                                            </button>
                                        </div>

                                        {/* Mostrar un resumen de los campos modificados */}
                                        <details className="mt-3">
                                            <summary className="cursor-pointer text-sm text-aqua hover:text-blue-700 font-worksans">
                                                Ver contenido de esta versión
                                            </summary>
                                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                {version.factores && (
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <span className="font-medium">Factores:</span>
                                                        <p className="text-gray-600 truncate">{version.factores}</p>
                                                    </div>
                                                )}
                                                {version.anamnesis && (
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <span className="font-medium">Anamnesis:</span>
                                                        <p className="text-gray-600 truncate">{version.anamnesis}</p>
                                                    </div>
                                                )}
                                                {version.motivo_consulta && (
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <span className="font-medium">Motivo Consulta:</span>
                                                        <p className="text-gray-600 truncate">{version.motivo_consulta}</p>
                                                    </div>
                                                )}
                                                {version.diagnostico && (
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <span className="font-medium">Diagnóstico:</span>
                                                        <p className="text-gray-600 truncate">{version.diagnostico}</p>
                                                    </div>
                                                )}
                                                {version.intervenciones && (
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        <span className="font-medium">Intervenciones:</span>
                                                        <p className="text-gray-600 truncate">{version.intervenciones}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </details>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: Fichas de Estudiantes */}
                {activeTab === 'estudiantes' && isDocente && ficha.es_plantilla && (
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
                                <p className="text-gray-400 font-worksans text-sm mt-2">
                                    Cuando los estudiantes creen sus fichas desde esta plantilla, aparecerán aquí.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {fichasEstudiantes.map((fichaEst) => (
                                    <Link
                                        key={fichaEst.id}
                                        to={`/fichas/${fichaEst.id}`}
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
                                                    Creada: {new Date(fichaEst.fecha_creacion || '').toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-500 font-worksans">
                                                    Modificada: {new Date(fichaEst.fecha_modificacion || '').toLocaleDateString()}
                                                </p>
                                                {fichaEst.total_versiones !== undefined && fichaEst.total_versiones > 0 && (
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2 font-worksans">
                                Eliminar Ficha
                            </h3>
                            <p className="text-sm text-gray-500 font-worksans mb-6">
                                ¿Estás seguro de que deseas eliminar esta ficha? Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors font-worksans"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isProcessing}
                                className={`px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors font-worksans ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
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
