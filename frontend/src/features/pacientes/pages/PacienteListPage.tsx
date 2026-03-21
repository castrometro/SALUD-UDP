import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Paciente } from '../types';
import { getPacientes, deletePaciente } from '../services/pacienteService';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { formatRut } from '@/utils/rut';
import Pagination from '@/components/ui/Pagination';

const PacienteListPage = () => {
    const [pacientes, setPacientes] = useState<Paciente[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        loadPacientes();
    }, [currentPage]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (currentPage === 1) {
                loadPacientes();
            } else {
                setCurrentPage(1);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const loadPacientes = async () => {
        try {
            setLoading(true);
            const data = await getPacientes(currentPage, searchTerm);
            setPacientes(data.results);
            const calculatedTotalPages = Math.ceil(data.count / itemsPerPage);
            setTotalPages(calculatedTotalPages);
            setTotalItems(data.count);
        } catch (error) {
            console.error('Error loading pacientes', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-beige">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-arizona font-medium text-gray-900">Gestión de Pacientes</h1>
                        <p className="text-gray-500 mt-1 font-worksans">Administra la información de los pacientes de la clínica.</p>
                    </div>
                    <Link
                        to="/pacientes/nuevo"
                        className="inline-flex items-center px-4 py-2 bg-aqua text-white rounded-full font-medium hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nuevo Paciente
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
                            placeholder="Buscar por nombre, apellido o RUT..."
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
                                        Paciente
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        RUT
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        Contacto
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        Previsión
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pacientes.length > 0 ? (
                                    pacientes.map((paciente) => (
                                        <tr key={paciente.rut} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                            {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 font-worksans">
                                                            {paciente.nombre} {paciente.apellido}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-worksans">
                                                            {paciente.edad} años
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 font-worksans">
                                                    {formatRut(paciente.rut)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 font-worksans">{paciente.correo}</div>
                                                <div className="text-sm text-gray-500 font-worksans">{paciente.numero_telefono}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full font-worksans ${paciente.prevision === 'FONASA' ? 'bg-green-100 text-green-800' :
                                                    paciente.prevision === 'ISAPRE' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {paciente.prevision}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link to={`/pacientes/${paciente.id}`} className="text-gray-400 hover:text-blue-600 transition-colors">
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                    <Link to={`/pacientes/${paciente.id}/editar`} className="text-gray-400 hover:text-amber-500 transition-colors">
                                                        <Edit2 className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(paciente)}
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
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500 font-worksans">
                                            {loading ? 'Cargando pacientes...' : 'No se encontraron pacientes que coincidan con tu búsqueda.'}
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

export default PacienteListPage;
