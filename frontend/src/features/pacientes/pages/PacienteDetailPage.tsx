import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    User, Phone, Mail, MapPin, Calendar, Activity,
    FileText, Plus, Clock, ChevronLeft
} from 'lucide-react';
import { formatRut } from '@/utils/rut';
import { Paciente } from '../types';
import { FichaAmbulatoria } from '../../fichas/types';
import { getPaciente } from '../services/pacienteService';
import { getFichasByPaciente } from '../../fichas/services/fichaService';

const PacienteDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [fichas, setFichas] = useState<FichaAmbulatoria[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData(parseInt(id));
        }
    }, [id]);

    const loadData = async (id: number) => {
        try {
            const [pacienteData, fichasData] = await Promise.all([
                getPaciente(id),
                getFichasByPaciente(id, 1, 1000) // Fetch up to 1000 to maintain grouping logic for now
            ]);
            setPaciente(pacienteData);
            setFichas(fichasData.results);
        } catch (error) {
            console.error('Error loading data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;
    if (!paciente) return <div className="p-8 text-center">Paciente no encontrado</div>;

    return (
        <div className="min-h-screen bg-beige pb-12">
            {/* Top Navigation */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/pacientes" className="inline-flex items-center text-gray-500 hover:text-aqua transition-colors font-worksans">
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Volver a la lista
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header / Patient Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="h-24 w-24 rounded-full bg-aqua/10 flex items-center justify-center text-aqua text-3xl font-bold border-4 border-white shadow-sm">
                                {paciente.nombre.charAt(0)}{paciente.apellido.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-arizona font-bold text-gray-900">
                                    {paciente.nombre} {paciente.apellido}
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold font-worksans">
                                        {formatRut(paciente.rut)}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold font-worksans ${paciente.prevision === 'FONASA' ? 'bg-green-100 text-green-800' :
                                        paciente.prevision === 'ISAPRE' ? 'bg-purple-100 text-purple-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {paciente.prevision}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors font-worksans">
                                Editar Perfil
                            </button>
                            <Link
                                to={`/fichas/nueva?paciente=${paciente.id}`}
                                className="px-4 py-2 bg-aqua text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2 font-worksans"
                            >
                                <Plus className="w-5 h-5" />
                                Nueva Ficha
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-worksans">Fecha de Nacimiento</p>
                                <p className="font-medium text-gray-900 font-worksans">{new Date(paciente.fecha_nacimiento).toLocaleDateString()} ({paciente.edad} años)</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-worksans">Correo Electrónico</p>
                                <p className="font-medium text-gray-900 font-worksans">{paciente.correo}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-worksans">Teléfono</p>
                                <p className="font-medium text-gray-900 font-worksans">{paciente.numero_telefono}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-worksans">Domicilio</p>
                                <p className="font-medium text-gray-900 font-worksans">{paciente.domicilio}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clinical History Section */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-arizona font-medium text-gray-900 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-aqua" />
                        Historial Clínico
                    </h2>
                </div>

                <div className="space-y-6">
                    {(() => {
                        // Agrupar fichas por caso base
                        const bases = fichas.filter(f => f.es_plantilla);
                        const sinBase = fichas.filter(f => !f.es_plantilla && !f.ficha_base);

                        return (
                            <>
                                {bases.map((baseFicha) => {
                                    const copiasAlumnos = fichas.filter(f => f.ficha_base === baseFicha.id);

                                    return (
                                        <div key={baseFicha.id} className="space-y-3">
                                            {/* Tarjeta de Caso Base (Docente) */}
                                            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-l-purple-500 border-gray-100 hover:shadow-md transition-shadow duration-200">
                                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold font-worksans uppercase tracking-wide">
                                                                Caso Clínico (Docente)
                                                            </span>
                                                            <span className="flex items-center text-sm text-gray-500 font-worksans">
                                                                <Clock className="w-4 h-4 mr-1" />
                                                                {new Date(baseFicha.fecha_modificacion || baseFicha.fecha_creacion || '').toLocaleDateString()} - {new Date(baseFicha.fecha_modificacion || baseFicha.fecha_creacion || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-900 font-arizona mb-1">
                                                            {baseFicha.contenido?.motivo_consulta}
                                                        </h3>
                                                        <p className="text-gray-600 font-worksans text-sm line-clamp-2">
                                                            Diagnóstico Base: <span className="font-medium text-gray-900">{baseFicha.contenido?.diagnostico}</span>
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                                        <div className="text-right hidden md:block">
                                                            <p className="text-xs text-gray-500 font-worksans">Autor del Caso</p>
                                                            <p className="text-sm font-medium text-gray-900 font-worksans">{baseFicha.creado_por_nombre}</p>
                                                        </div>
                                                        <Link
                                                            to={`/fichas/${baseFicha.id}`}
                                                            className="p-2 text-gray-400 hover:text-aqua hover:bg-aqua/5 rounded-full transition-colors"
                                                            title="Ver detalle del caso"
                                                        >
                                                            <FileText className="w-6 h-6" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sub-lista de Copias de Alumnos */}
                                            {copiasAlumnos.length > 0 && (
                                                <div className="pl-8 border-l-2 border-gray-200 ml-6 space-y-3">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-worksans mb-2">
                                                        Trabajos de Estudiantes ({copiasAlumnos.length})
                                                    </p>
                                                    {copiasAlumnos.map((fichaAlumno) => (
                                                        <div key={fichaAlumno.id} className="bg-white/60 rounded-lg p-4 shadow-sm border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-200">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold font-worksans uppercase tracking-wide">
                                                                            Alumno
                                                                        </span>
                                                                        <p className="text-sm font-medium text-gray-900 font-worksans">
                                                                            {fichaAlumno.estudiante_nombre || fichaAlumno.creado_por_nombre}
                                                                        </p>
                                                                        <span className="text-xs text-gray-400 font-worksans flex items-center">
                                                                            <Clock className="w-3 h-3 mr-1" />
                                                                            {new Date(fichaAlumno.fecha_modificacion || fichaAlumno.fecha_creacion || '').toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <Link
                                                                    to={`/fichas/${fichaAlumno.id}`}
                                                                    className="text-gray-400 hover:text-aqua p-1 rounded-full hover:bg-aqua/5 transition-colors"
                                                                    title="Ver ficha de estudiante"
                                                                >
                                                                    <FileText className="w-5 h-5" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {sinBase.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider font-worksans mb-4">
                                            Otras Atenciones / Fichas sin caso base
                                        </h3>
                                        {sinBase.map((ficha) => (
                                            <div key={ficha.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-4">
                                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold font-worksans uppercase tracking-wide">
                                                                Atención Directa
                                                            </span>
                                                            <span className="flex items-center text-sm text-gray-500 font-worksans">
                                                                <Clock className="w-4 h-4 mr-1" />
                                                                {new Date(ficha.fecha_modificacion || ficha.fecha_creacion || '').toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-900 font-arizona">
                                                            {ficha.contenido?.motivo_consulta}
                                                        </h3>
                                                    </div>
                                                    <Link
                                                        to={`/fichas/${ficha.id}`}
                                                        className="p-2 text-gray-400 hover:text-aqua"
                                                    >
                                                        <FileText className="w-6 h-6" />
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default PacienteDetailPage;
