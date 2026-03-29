import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Phone, Mail, MapPin, Calendar, Activity,
    FileText, Clock, ChevronLeft, Users, BookOpen, Heart
} from 'lucide-react';
import { formatRut } from '@/utils/rut';
import { Paciente } from '../types';
import { AtencionClinica } from '../../fichas/types';
import { getPaciente } from '../services/pacienteService';
import { getAtencionesClinicas } from '../../fichas/services/fichaService';

const PacienteDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [paciente, setPaciente] = useState<Paciente | null>(null);
    const [atenciones, setAtenciones] = useState<AtencionClinica[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData(parseInt(id));
        }
    }, [id]);

    const loadData = async (pacienteId: number) => {
        try {
            const [pacienteData, atencionesData] = await Promise.all([
                getPaciente(pacienteId),
                getAtencionesClinicas(1, 1000, undefined, pacienteId)
            ]);
            setPaciente(pacienteData);
            setAtenciones(atencionesData.results);
        } catch (error) {
            console.error('Error loading data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;
    if (!paciente) return <div className="p-8 text-center">Paciente no encontrado</div>;

    return (
        <div className="bg-beige pb-12">
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
                                    {paciente.sexo && paciente.sexo !== 'NO_INFORMA' && (
                                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold font-worksans">
                                            {paciente.sexo === 'MASCULINO' ? 'Masculino' : paciente.sexo === 'FEMENINO' ? 'Femenino' : 'Otro'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to={`/pacientes/${paciente.id}/editar`}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors font-worksans"
                            >
                                Editar Paciente
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
                                <p className="font-medium text-gray-900 font-worksans">{paciente.correo || <span className="text-gray-400 italic">No registrado</span>}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-worksans">Teléfono</p>
                                <p className="font-medium text-gray-900 font-worksans">{paciente.numero_telefono || <span className="text-gray-400 italic">No registrado</span>}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500 font-worksans">Domicilio</p>
                                <p className="font-medium text-gray-900 font-worksans">{paciente.domicilio || <span className="text-gray-400 italic">No registrado</span>}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Perfil Clínico */}
                {(paciente.antecedentes_personales || paciente.medicamentos_habituales || paciente.alergias) && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                        <h2 className="text-xl font-arizona font-medium text-gray-900 flex items-center gap-2 mb-6">
                            <Heart className="w-5 h-5 text-red-400" />
                            Perfil Clínico
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 font-worksans mb-1">Antecedentes Personales</p>
                                <p className="text-gray-900 font-worksans whitespace-pre-line">
                                    {paciente.antecedentes_personales || <span className="text-gray-400 italic">Sin información</span>}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-worksans mb-1">Medicamentos Habituales</p>
                                <p className="text-gray-900 font-worksans whitespace-pre-line">
                                    {paciente.medicamentos_habituales || <span className="text-gray-400 italic">Sin información</span>}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-worksans mb-1">Alergias</p>
                                <p className="text-gray-900 font-worksans whitespace-pre-line">
                                    {paciente.alergias || <span className="text-gray-400 italic">Sin información</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Atenciones Clínicas */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-arizona font-medium text-gray-900 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-aqua" />
                        Atenciones Clínicas
                    </h2>
                </div>

                {atenciones.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-worksans text-lg">No hay atenciones clínicas para este paciente.</p>
                        <p className="text-gray-400 font-worksans text-sm mt-2">
                            Cree una atención clínica desde un caso clínico.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {atenciones.map((atencion) => (
                            <div key={atencion.id} className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-l-purple-500 border-gray-100 hover:shadow-md transition-shadow duration-200">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold font-worksans uppercase tracking-wide">
                                                Atención
                                            </span>
                                            <span className="flex items-center text-sm text-gray-500 font-worksans">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {new Date(atencion.fecha_atencion).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 font-arizona mb-1">
                                            {atencion.caso_clinico_detail?.titulo || 'Caso clínico'}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="flex items-center text-sm text-gray-600 font-worksans">
                                                <Users className="w-4 h-4 mr-1 text-green-600" />
                                                {atencion.total_estudiantes} estudiante{atencion.total_estudiantes !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                        <div className="text-right hidden md:block">
                                            <p className="text-xs text-gray-500 font-worksans">Creado por</p>
                                            <p className="text-sm font-medium text-gray-900 font-worksans">{atencion.creado_por_nombre}</p>
                                        </div>
                                        <Link
                                            to={`/atenciones/${atencion.id}`}
                                            className="p-2 text-gray-400 hover:text-aqua hover:bg-aqua/5 rounded-full transition-colors"
                                            title="Ver atención clínica"
                                        >
                                            <FileText className="w-6 h-6" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PacienteDetailPage;
