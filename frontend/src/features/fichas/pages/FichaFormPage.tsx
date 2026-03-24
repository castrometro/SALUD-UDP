import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCasoClinico, getCasoClinico, updateCasoClinico } from '../services/fichaService';
import PacienteSelect from '../components/PacienteSelect';
import Toast from '@/components/ui/Toast';

const FichaFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [formData, setFormData] = useState<{
        titulo: string;
        descripcion: string;
        paciente: number | undefined;
    }>({
        titulo: '',
        descripcion: '',
        paciente: undefined,
    });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (isEdit && id) {
            loadCaso(Number(id));
        }
    }, [isEdit, id]);

    const loadCaso = async (casoId: number) => {
        try {
            const data = await getCasoClinico(casoId);
            setFormData({
                titulo: data.titulo,
                descripcion: data.descripcion || '',
                paciente: data.paciente,
            });
        } catch (error) {
            console.error('Error loading caso clínico', error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.paciente) {
            setToast({ message: 'Debes seleccionar un paciente', type: 'error' });
            return;
        }
        try {
            if (isEdit && id) {
                await updateCasoClinico(Number(id), {
                    titulo: formData.titulo,
                    descripcion: formData.descripcion,
                });
                setToast({ message: 'Caso clínico actualizado exitosamente', type: 'success' });
                setTimeout(() => navigate(`/casos-clinicos/${id}`), 1200);
            } else {
                const nuevo = await createCasoClinico({
                    titulo: formData.titulo,
                    descripcion: formData.descripcion,
                    paciente: formData.paciente,
                });
                setToast({ message: 'Caso clínico creado exitosamente', type: 'success' });
                setTimeout(() => navigate(`/casos-clinicos/${nuevo.id}`), 1200);
            }
        } catch (error) {
            console.error('Error saving caso clínico', error);
            setToast({ message: 'Error al guardar el caso clínico', type: 'error' });
        }
    };

    return (
        <div className="bg-beige">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-arizona font-medium text-gray-900 mb-2">
                {isEdit ? 'Editar Caso Clínico' : 'Crear Caso Clínico'}
            </h1>

            {!isEdit && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-purple-800 font-worksans text-sm">
                        <strong>Caso Clínico:</strong> Define el título y descripción del caso.
                        Los estudiantes crearán sus propias fichas con contenido clínico en blanco para completar.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">

                {/* Título */}
                <div>
                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título del Caso Clínico</label>
                    <input
                        type="text"
                        name="titulo"
                        id="titulo"
                        required
                        value={formData.titulo}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Ej: Caso de hipertensión arterial"
                    />
                </div>

                {/* Descripción */}
                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción del Caso</label>
                    <textarea
                        name="descripcion"
                        id="descripcion"
                        rows={8}
                        value={formData.descripcion}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Describe el caso clínico con la narrativa completa que los estudiantes usarán como referencia..."
                    />
                    <p className="mt-1 text-xs text-gray-500 font-worksans">
                        Esta descripción será visible para los estudiantes como contexto del caso.
                    </p>
                </div>

                {/* Paciente */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                    <PacienteSelect
                        value={formData.paciente}
                        onChange={(pacienteId) => setFormData(prev => ({ ...prev, paciente: pacienteId }))}
                        disabled={isEdit}
                    />
                    {isEdit && (
                        <p className="mt-1 text-xs text-gray-500 font-worksans">
                            El paciente no se puede cambiar una vez creado el caso.
                        </p>
                    )}
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
