import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plantilla, CONTENIDO_DEFAULT } from '../types';
import { createPlantilla, getPlantilla, updatePlantilla } from '../services/fichaService';
import Toast from '@/components/ui/Toast';

const FichaFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Partial<Plantilla>>({
        titulo: '',
        descripcion: '',
        contenido: { ...CONTENIDO_DEFAULT },
    });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            loadPlantilla(Number(id));
        }
    }, [isEdit, id]);

    const loadPlantilla = async (plantillaId: number) => {
        try {
            const data = await getPlantilla(plantillaId);
            setFormData(data);
        } catch (error) {
            console.error('Error loading plantilla', error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            contenido: { ...prev.contenido, [name]: value } as Plantilla['contenido'],
        }));
    };

    const handleMetaChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (isEdit && id) {
                await updatePlantilla(Number(id), formData);
                setToast({ message: 'Plantilla actualizada exitosamente', type: 'success' });
                setTimeout(() => navigate(`/plantillas/${id}`), 1200);
            } else {
                const nueva = await createPlantilla(formData);
                setToast({ message: 'Plantilla creada exitosamente', type: 'success' });
                setTimeout(() => navigate(`/plantillas/${nueva.id}`), 1200);
            }
        } catch (error) {
            console.error('Error saving plantilla', error);
            setToast({ message: 'Error al guardar la plantilla', type: 'error' });
        }
    };

    return (
        <div className="bg-beige">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-arizona font-medium text-gray-900 mb-2">
                {isEdit ? 'Editar Plantilla' : 'Crear Plantilla Clínica'}
            </h1>

            {!isEdit && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-purple-800 font-worksans text-sm">
                        <strong>Plantilla:</strong> Define el contenido clínico base.
                        Luego podrás asignarla a pacientes (casos clínicos) y los estudiantes crearán sus propias fichas.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">

                {/* Título */}
                <div>
                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título de la Plantilla</label>
                    <input
                        type="text"
                        name="titulo"
                        id="titulo"
                        required
                        value={formData.titulo ?? ''}
                        onChange={handleMetaChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Ej: Caso de hipertensión arterial"
                    />
                </div>

                {/* Descripción */}
                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                        name="descripcion"
                        id="descripcion"
                        rows={2}
                        value={formData.descripcion ?? ''}
                        onChange={handleMetaChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Breve descripción del caso clínico"
                    />
                </div>

                <hr className="border-gray-200" />
                <h2 className="text-lg font-worksans font-semibold text-gray-800">Contenido Clínico</h2>

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
                        onClick={() => navigate(-1)}
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
        </div>
    );
};

export default FichaFormPage;
