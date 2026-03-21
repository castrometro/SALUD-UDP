import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EstudianteCreateData } from '../types';
import { createEstudiante, getEstudiante, updateEstudiante } from '../services/estudianteService';
import { formatRut, validateRut } from '@/utils/rut';

const EstudianteFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [formData, setFormData] = useState<EstudianteCreateData>({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        rut: '',
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit && id) {
            loadEstudiante(parseInt(id));
        }
    }, [isEdit, id]);

    const loadEstudiante = async (estudianteId: number) => {
        try {
            const data = await getEstudiante(estudianteId);
            setFormData({
                email: data.email,
                password: '',
                first_name: data.first_name,
                last_name: data.last_name,
                rut: data.rut,
            });
        } catch (error) {
            console.error('Error loading estudiante', error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'rut') {
            setFormData(prev => ({ ...prev, [name]: formatRut(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateRut(formData.rut)) {
            alert('El RUT ingresado no es válido');
            return;
        }
        setLoading(true);
        try {
            if (isEdit && id) {
                const { password, ...updateData } = formData;
                await updateEstudiante(parseInt(id), updateData);
            } else {
                if (!formData.password) {
                    alert('La contraseña es obligatoria para crear un estudiante');
                    setLoading(false);
                    return;
                }
                await createEstudiante(formData);
            }
            navigate('/estudiantes');
        } catch (error: any) {
            console.error('Error saving estudiante', error);
            const detail = error.response?.data;
            if (detail && typeof detail === 'object') {
                const messages = Object.entries(detail)
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
                    .join('\n');
                alert(`Error al guardar:\n${messages}`);
            } else {
                alert('Error al guardar el estudiante');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-beige">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-arizona font-medium text-gray-900 mb-6">
                {isEdit ? 'Editar Estudiante' : 'Nuevo Estudiante'}
            </h1>

            <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            name="first_name"
                            id="first_name"
                            required
                            value={formData.first_name}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Apellido</label>
                        <input
                            type="text"
                            name="last_name"
                            id="last_name"
                            required
                            value={formData.last_name}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="rut" className="block text-sm font-medium text-gray-700">RUT</label>
                        <input
                            type="text"
                            name="rut"
                            id="rut"
                            required
                            disabled={isEdit}
                            value={formData.rut}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    {!isEdit && (
                        <div className="sm:col-span-6">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                required={!isEdit}
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/estudiantes')}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
};

export default EstudianteFormPage;
