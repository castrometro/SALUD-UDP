import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CasoClinico } from '../types';
import { getCasosClinicos, deleteCasoClinico } from '../services/fichaService';
import { Search, Plus, Eye, Trash2, Users, FileText, Pencil, BookOpen } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/features/auth/context/AuthContext';
import { formatRut } from '@/utils/rut';

const FichaListPage = () => {
    const { user } = useAuth();
    const [casos, setCasos] = useState<CasoClinico[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const itemsPerPage = 10;

    const isDocente = user?.role === 'ADMIN' || user?.role === 'DOCENTE';

    useEffect(() => {
        loadCasos();
    }, [currentPage]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (currentPage === 1) {
                loadCasos();
            } else {
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadCasos = async () => {
        try {
            setLoading(true);
            const data = await getCasosClinicos(currentPage, itemsPerPage, undefined, searchTerm || undefined);
            setCasos(data.results);
            setTotalPages(Math.ceil(data.count / itemsPerPage));
            setTotalItems(data.count);
        } catch (error) {
            console.error('Error loading casos clínicos', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (caso: CasoClinico) => {
        if (!window.confirm(`¿Estás seguro de eliminar el caso clínico "${caso.titulo}"?`)) return;
        try {
            await deleteCasoClinico(caso.id);
            setToast({ message: 'Caso clínico eliminado exitosamente', type: 'success' });
            loadCasos();
        } catch (error: any) {
            console.error('Error eliminando caso clínico', error);
            const msg = error.response?.data?.detail || 'Error al eliminar el caso clínico';
            setToast({ message: msg, type: 'error' });
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('es-CL');
    };

    return (
        <div className="bg-beige">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-arizona font-medium text-gray-900">Casos Clínicos</h1>
                        <p className="text-gray-500 mt-1 font-worksans">
                            Gestiona los casos clínicos y revisa el avance de los estudiantes.
                        </p>
                    </div>
                    {isDocente && (
                        <Link
                            to="/casos-clinicos/nuevo"
                            className="inline-flex items-center px-4 py-2 bg-aqua text-white rounded-full font-medium hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nuevo Caso Clínico
                        </Link>
                    )}
                </div>

                {/* Resumen rápido */}
                {!loading && casos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <p className="text-sm text-gray-500 font-worksans">Total casos clínicos</p>
                            <p className="text-2xl font-arizona font-medium text-gray-900">{totalItems}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <p className="text-sm text-gray-500 font-worksans">Estudiantes trabajando</p>
                            <p className="text-2xl font-arizona font-medium text-gray-900">
                                {casos.reduce((acc, c) => acc + (c.total_estudiantes || 0), 0)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-aqua focus:border-aqua sm:text-sm transition duration-150 ease-in-out"
                            placeholder="Buscar por título o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        Caso Clínico
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        Paciente
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        Estudiantes
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        Fecha
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {casos.length > 0 ? (
                                    casos.map((caso) => (
                                        <tr key={caso.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                            <BookOpen className="w-5 h-5" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <Link
                                                            to={`/casos-clinicos/${caso.id}`}
                                                            className="text-sm font-medium text-gray-900 hover:text-aqua font-worksans"
                                                        >
                                                            {caso.titulo}
                                                        </Link>
                                                        <div className="text-sm text-gray-500 font-worksans max-w-xs truncate">
                                                            {caso.descripcion || <span className="text-gray-400 italic">Sin descripción</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {caso.paciente_detail ? (
                                                    <div>
                                                        <Link
                                                            to={`/pacientes/${caso.paciente_detail.id}`}
                                                            className="text-sm font-medium text-gray-900 hover:text-aqua font-worksans"
                                                        >
                                                            {caso.paciente_detail.nombre} {caso.paciente_detail.apellido}
                                                        </Link>
                                                        <div className="text-xs text-gray-500 font-worksans">
                                                            {formatRut(caso.paciente_detail.rut)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 font-worksans">Paciente #{caso.paciente}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {(caso.total_estudiantes || 0) > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-sm font-worksans">
                                                        <Users className="w-4 h-4" />
                                                        {caso.total_estudiantes}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 text-sm font-worksans">
                                                        <Users className="w-4 h-4" />
                                                        0
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-worksans">
                                                    {formatDate(caso.fecha_creacion)}
                                                </div>
                                                <div className="text-xs text-gray-400 font-worksans">
                                                    por {caso.creado_por_nombre || '—'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-1">
                                                    <Link
                                                        to={`/casos-clinicos/${caso.id}`}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="Ver detalle"
                                                    >
                                                        <Eye className="w-4.5 h-4.5" />
                                                    </Link>
                                                    {isDocente && (
                                                        <>
                                                            <Link
                                                                to={`/casos-clinicos/${caso.id}/editar`}
                                                                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                                                title="Editar caso clínico"
                                                            >
                                                                <Pencil className="w-4.5 h-4.5" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(caso)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="w-4.5 h-4.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aqua"></div>
                                                    <span className="ml-3 text-gray-500 font-worksans">Cargando casos clínicos...</span>
                                                </div>
                                            ) : (
                                                <div>
                                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500 font-worksans mb-1">No se encontraron casos clínicos.</p>
                                                    {isDocente && (
                                                        <Link
                                                            to="/casos-clinicos/nuevo"
                                                            className="text-aqua hover:text-blue-600 font-worksans text-sm font-medium"
                                                        >
                                                            Crear tu primer caso clínico
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white px-4 py-3 border-t border-gray-200">
                        {loading ? (
                            <div className="text-center py-4 text-gray-500">Cargando...</div>
                        ) : (
                            <>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    hasNext={currentPage < totalPages}
                                    hasPrevious={currentPage > 1}
                                />
                                <div className="text-center mt-2 text-sm text-gray-500 font-worksans">
                                    Mostrando {Math.min(((currentPage - 1) * itemsPerPage) + 1, totalItems)} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FichaListPage;
