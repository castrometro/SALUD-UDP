import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Estudiante } from '../types';
import { getEstudiantes, deleteEstudiante } from '../services/estudianteService';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { formatRut } from '@/utils/rut';
import Pagination from '@/components/ui/Pagination';

const EstudianteListPage = () => {
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        loadEstudiantes();
    }, [currentPage]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (currentPage === 1) {
                loadEstudiantes();
            } else {
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadEstudiantes = async () => {
        try {
            setLoading(true);
            const data = await getEstudiantes(currentPage, searchTerm);
            setEstudiantes(data.results);
            const calculatedTotalPages = Math.ceil(data.count / itemsPerPage);
            setTotalPages(calculatedTotalPages);
            setTotalItems(data.count);
        } catch (error) {
            console.error('Error loading estudiantes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (estudiante: Estudiante) => {
        if (!window.confirm(`¿Estás seguro de eliminar al estudiante ${estudiante.first_name} ${estudiante.last_name}?`)) return;
        try {
            await deleteEstudiante(estudiante.id);
            loadEstudiantes();
        } catch (_error) {
            console.error('Error eliminando estudiante', _error);
        }
    };

    return (
        <div className="bg-beige">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-arizona font-medium text-gray-900">Gestión de Estudiantes</h1>
                        <p className="text-gray-500 mt-1 font-worksans">Administra la información de los estudiantes de la clínica.</p>
                    </div>
                    <Link
                        to="/estudiantes/nuevo"
                        className="inline-flex items-center px-4 py-2 bg-aqua text-white rounded-full font-medium hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nuevo Estudiante
                    </Link>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-aqua focus:border-aqua sm:text-sm transition duration-150 ease-in-out"
                            placeholder="Buscar por nombre, apellido, RUT o email..."
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
                                        Estudiante
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        RUT
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {estudiantes.length > 0 ? (
                                    estudiantes.map((estudiante) => (
                                        <tr key={estudiante.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                            {estudiante.first_name.charAt(0)}{estudiante.last_name.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 font-worksans">
                                                            {estudiante.first_name} {estudiante.last_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 font-worksans">
                                                    {formatRut(estudiante.rut)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-worksans">{estudiante.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        to={`/estudiantes/${estudiante.id}`}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                    <Link to={`/estudiantes/${estudiante.id}/editar`} className="text-gray-400 hover:text-amber-500 transition-colors">
                                                        <Edit2 className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(estudiante)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500 font-worksans">
                                            {loading ? 'Cargando estudiantes...' : 'No se encontraron estudiantes que coincidan con tu búsqueda.'}
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
                                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstudianteListPage;
