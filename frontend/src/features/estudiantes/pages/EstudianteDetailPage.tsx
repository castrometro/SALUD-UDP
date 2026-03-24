import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Estudiante } from '../types';
import { getEstudiante } from '../services/estudianteService';
import { getFichasEstudiante } from '../../fichas/services/fichaService';
import { FichaEstudiante } from '../../fichas/types';
import EstudianteFichasTab from '../components/EstudianteFichasTab';
import EstudianteCasosTab from '../components/EstudianteCasosTab';
import { ChevronLeft, Mail, CreditCard, User, AlertCircle, FileText, Users } from 'lucide-react';
import { formatRut } from '@/utils/rut';

const EstudianteDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
    const [fichas, setFichas] = useState<FichaEstudiante[]>([]);
    const [activeTab, setActiveTab] = useState<'fichas' | 'casos'>('fichas');
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (id) {
            loadData(parseInt(id));
        }
    }, [id, currentPage]);

    const loadData = async (estudianteId: number) => {
        try {
            // Fetch estudiante only once or if needed, but for simplicity fetch both
            // Ideally we shouldn't re-fetch estudiante on page change, but it's fine for now
            const [estudianteData, fichasData] = await Promise.all([
                getEstudiante(estudianteId),
                getFichasEstudiante(currentPage, 10, estudianteId)
            ]);
            setEstudiante(estudianteData);
            setFichas(fichasData.results);
            setTotalPages(Math.ceil(fichasData.count / 10)); // Assuming page size 10
        } catch (error) {
            console.error('Error loading datas', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aqua mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-worksans">Cargando estudiante...</p>
                </div>
            </div>
        );
    }

    if (!estudiante) {
        return (
            <div className="bg-beige flex items-center justify-center py-20">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Estudiante no encontrado</h2>
                    <p className="text-gray-600 mb-4">El estudiante que buscas no existe o fue eliminado.</p>
                    <Link to="/estudiantes" className="text-aqua hover:text-blue-600 font-medium">
                        Volver a la lista de estudiantes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-beige pb-12">
            {/* Top Navigation */}
            <div className="bg-white shadow-sm border-b border-gray-200 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        to="/estudiantes"
                        className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Volver a estudiantes
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-bold border-4 border-white shadow-md">
                            {estudiante.first_name.charAt(0)}{estudiante.last_name.charAt(0)}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-arizona font-bold text-gray-900">
                                {estudiante.first_name} {estudiante.last_name}
                            </h1>
                            <p className="text-indigo-600 font-medium mt-1 font-worksans">Estudiante de Salud</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                                <div className="flex items-center gap-2 text-gray-600 font-worksans">
                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                    <span>{formatRut(estudiante.rut)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 font-worksans">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span>{estudiante.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h2 className="text-xl font-worksans font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" />
                            Información Académica
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Estado</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    {estudiante.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Rol de Usuario</span>
                                <span className="text-gray-900 font-medium capitalize">{estudiante.role.toLowerCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Future: Activity Section */}
                {/* History Section */}
                <div className="mt-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Tabs Header */}
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('fichas')}
                                    className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'fichas'
                                        ? 'border-aqua text-aqua'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FileText className="w-5 h-5" />
                                    Fichas Clínicas
                                </button>
                                <button
                                    onClick={() => setActiveTab('casos')}
                                    className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center gap-2 ${activeTab === 'casos'
                                        ? 'border-aqua text-aqua'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Users className="w-5 h-5" />
                                    Casos (Pacientes)
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'fichas' ? (
                                <EstudianteFichasTab
                                    fichas={fichas}
                                    pagination={{
                                        currentPage,
                                        totalPages,
                                        onPageChange: setCurrentPage,
                                        hasNext: currentPage < totalPages,
                                        hasPrevious: currentPage > 1
                                    }}
                                />
                            ) : (
                                <EstudianteCasosTab fichas={fichas} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstudianteDetailPage;
