import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Estudiante } from '../types';
import { getEstudiante } from '../services/estudianteService';
import { ChevronLeft, Mail, CreditCard, User, AlertCircle } from 'lucide-react';
import { formatRut } from '../../../utils/rut';

const EstudianteDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [estudiante, setEstudiante] = useState<Estudiante | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadEstudiante(parseInt(id));
        }
    }, [id]);

    const loadEstudiante = async (estudianteId: number) => {
        try {
            const data = await getEstudiante(estudianteId);
            setEstudiante(data);
        } catch (error) {
            console.error('Error loading estudiante', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-beige flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aqua mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-worksans">Cargando estudiante...</p>
                </div>
            </div>
        );
    }

    if (!estudiante) {
        return (
            <div className="min-h-screen bg-beige flex items-center justify-center">
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
        <div className="min-h-screen bg-beige pb-12">
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
                <div className="mt-8 bg-white/50 border border-dashed border-gray-300 rounded-2xl p-12 text-center">
                    <p className="text-gray-500 font-worksans italic">
                        Próximamente: Historial de fichas clínicas y evaluaciones del estudiante.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EstudianteDetailPage;
