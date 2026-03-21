import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FichaAmbulatoria, CONTENIDO_DEFAULT } from '../types';
import { createFicha, getFicha, updateFicha } from '../services/fichaService';
import PacienteSelect from '../components/PacienteSelect';
import { useAuth } from '../../auth/context/AuthContext';

const FichaFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const isEdit = !!id;
    const isDocente = user?.role === 'ADMIN' || user?.role === 'DOCENTE';

    // Obtener paciente de la URL si viene como query param
    const pacienteIdFromUrl = searchParams.get('paciente');

    const [formData, setFormData] = useState<Partial<FichaAmbulatoria>>({
        paciente: pacienteIdFromUrl ? parseInt(pacienteIdFromUrl) : undefined,
        es_plantilla: isDocente,
        contenido: { ...CONTENIDO_DEFAULT },
    });

    useEffect(() => {
        if (isEdit && id) {
            loadFicha(Number(id));
        }
    }, [isEdit, id]);

    // Actualizar paciente si cambia en la URL
    useEffect(() => {
        if (pacienteIdFromUrl && !isEdit) {
            setFormData(prev => ({ ...prev, paciente: parseInt(pacienteIdFromUrl) }));
        }
    }, [pacienteIdFromUrl, isEdit]);

    const loadFicha = async (id: number) => {
        try {
            const data = await getFicha(id);
            setFormData(data);
        } catch (error) {
            console.error('Error loading ficha', error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            contenido: { ...prev.contenido, [name]: value } as FichaAmbulatoria['contenido'],
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (isEdit && id) {
                await updateFicha(Number(id), formData);
                navigate(`/fichas/${id}`);
            } else {
                const nuevaFicha = await createFicha(formData);
                if (nuevaFicha.paciente || formData.paciente) {
                    navigate(`/pacientes/${nuevaFicha.paciente || formData.paciente}`);
                } else {
                    navigate(`/fichas/${nuevaFicha.id}`);
                }
            }
        } catch (error) {
            console.error('Error saving ficha', error);
            alert('Error al guardar la ficha');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {isEdit ? 'Editar Ficha' : (isDocente ? 'Crear Caso Clínico (Ficha Base)' : 'Nueva Ficha')}
            </h1>

            {/* Nota informativa para docentes */}
            {!isEdit && isDocente && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-purple-800 font-worksans text-sm">
                        <strong>📋 Ficha Base:</strong> Esta ficha servirá como caso clínico inicial.
                        Los estudiantes podrán crear sus propias copias para trabajar de forma independiente.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">

                <div className="mb-4">
                    <label htmlFor="paciente" className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                    <PacienteSelect
                        value={formData.paciente}
                        onChange={(id) => setFormData(prev => ({ ...prev, paciente: id }))}
                        disabled={isEdit || !!pacienteIdFromUrl}
                    />
                </div>

                {/* 1. Factores */}
                <div>
                    <label htmlFor="factores" className="block text-sm font-medium text-gray-700">Factores</label>
                    <textarea
                        name="factores"
                        id="factores"
                        rows={3}
                        value={formData.contenido?.factores ?? ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* 2. Anamnesis */}
                <div>
                    <label htmlFor="anamnesis" className="block text-sm font-medium text-gray-700">Anamnesis</label>
                    <textarea
                        name="anamnesis"
                        id="anamnesis"
                        rows={4}
                        value={formData.contenido?.anamnesis ?? ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* 3. Motivo de Consulta */}
                <div>
                    <label htmlFor="motivo_consulta" className="block text-sm font-medium text-gray-700">Motivo de Consulta</label>
                    <textarea
                        name="motivo_consulta"
                        id="motivo_consulta"
                        rows={3}
                        value={formData.contenido?.motivo_consulta ?? ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* 4. RAU Necesidades */}
                <div>
                    <label htmlFor="rau_necesidades" className="block text-sm font-medium text-gray-700">RAU Necesidades</label>
                    <textarea
                        name="rau_necesidades"
                        id="rau_necesidades"
                        rows={3}
                        value={formData.contenido?.rau_necesidades ?? ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* 5. Examen Físico */}
                <div>
                    <label htmlFor="examen_fisico" className="block text-sm font-medium text-gray-700">Examen Físico</label>
                    <textarea
                        name="examen_fisico"
                        id="examen_fisico"
                        rows={4}
                        value={formData.contenido?.examen_fisico ?? ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* 6. Instrumentos Aplicados */}
                <div>
                    <label htmlFor="instrumentos_aplicados" className="block text-sm font-medium text-gray-700">Instrumentos Aplicados</label>
                    <textarea
                        name="instrumentos_aplicados"
                        id="instrumentos_aplicados"
                        rows={3}
                        value={formData.contenido?.instrumentos_aplicados ?? ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* 7. Diagnóstico */}
                <div>
                    <label htmlFor="diagnostico" className="block text-sm font-medium text-gray-700">Diagnóstico</label>
                    <textarea
                        name="diagnostico"
                        id="diagnostico"
                        rows={3}
                        value={formData.contenido?.diagnostico ?? ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                {/* 8. Intervenciones */}
                <div>
                    <label htmlFor="intervenciones" className="block text-sm font-medium text-gray-700">Intervenciones</label>
                    <textarea
                        name="intervenciones"
                        id="intervenciones"
                        rows={3}
                        value={formData.contenido?.intervenciones ?? ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            if (formData.paciente) {
                                navigate(`/pacientes/${formData.paciente}`);
                            } else {
                                navigate(-1);
                            }
                        }}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FichaFormPage;
