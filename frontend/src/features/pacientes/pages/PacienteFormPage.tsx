import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paciente } from '../types';
import { createPaciente, getPaciente, updatePaciente } from '../services/pacienteService';
import { formatRut, validateRut } from '@/utils/rut';

const PacienteFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Paciente>({
        id: 0, // Placeholder
        rut: '',
        nombre: '',
        apellido: '',
        sexo: 'NO_INFORMA',
        prevision: '',
        correo: '',
        numero_telefono: '',
        fecha_nacimiento: '',
        domicilio: '',
        antecedentes_personales: '',
        medicamentos_habituales: '',
        alergias: '',
    });

    useEffect(() => {
        if (isEdit && id) {
            loadPaciente(parseInt(id));
        }
    }, [isEdit, id]);

    const loadPaciente = async (id: number) => {
        try {
            const data = await getPaciente(id);
            setFormData(data);
        } catch (error) {
            console.error('Error loading paciente', error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        try {
            if (isEdit && id) {
                await updatePaciente(parseInt(id), formData);
            } else {
                await createPaciente(formData);
            }
            navigate('/pacientes');
        } catch (error) {
            console.error('Error saving paciente', error);
            alert('Error al guardar el paciente');
        }
    };

    return (
        <div className="bg-beige">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-arizona font-medium text-gray-900 mb-6">
                {isEdit ? 'Editar Paciente' : 'Nuevo Paciente'}
            </h1>
            
            <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label htmlFor="rut" className="block text-sm font-medium text-gray-700">RUT</label>
                        <input
                            type="text"
                            name="rut"
                            id="rut"
                            disabled={isEdit}
                            required
                            value={formData.rut}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700">Fecha Nacimiento</label>
                        <input
                            type="date"
                            name="fecha_nacimiento"
                            id="fecha_nacimiento"
                            required
                            value={formData.fecha_nacimiento}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            id="nombre"
                            required
                            value={formData.nombre}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
                        <input
                            type="text"
                            name="apellido"
                            id="apellido"
                            required
                            value={formData.apellido}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="prevision" className="block text-sm font-medium text-gray-700">Previsión</label>
                        <select
                            name="prevision"
                            id="prevision"
                            required
                            value={formData.prevision}
                            onChange={handleChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="">Seleccione...</option>
                            <option value="FONASA">FONASA</option>
                            <option value="ISAPRE">ISAPRE</option>
                            <option value="PARTICULAR">PARTICULAR</option>
                        </select>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">Sexo</label>
                        <select
                            name="sexo"
                            id="sexo"
                            required
                            value={formData.sexo}
                            onChange={handleChange}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="MASCULINO">Masculino</option>
                            <option value="FEMENINO">Femenino</option>
                            <option value="OTRO">Otro</option>
                            <option value="NO_INFORMA">No informa</option>
                        </select>
                    </div>

                    <div className="sm:col-span-3">
                        <label htmlFor="numero_telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input
                            type="text"
                            name="numero_telefono"
                            id="numero_telefono"
                            value={formData.numero_telefono || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="correo" className="block text-sm font-medium text-gray-700">Correo</label>
                        <input
                            type="email"
                            name="correo"
                            id="correo"
                            value={formData.correo || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div className="sm:col-span-6">
                        <label htmlFor="domicilio" className="block text-sm font-medium text-gray-700">Domicilio</label>
                        <input
                            type="text"
                            name="domicilio"
                            id="domicilio"
                            value={formData.domicilio || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>
                </div>

                {/* Perfil Clínico */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Perfil Clínico</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="antecedentes_personales" className="block text-sm font-medium text-gray-700">Antecedentes Personales</label>
                            <textarea
                                name="antecedentes_personales"
                                id="antecedentes_personales"
                                rows={3}
                                value={formData.antecedentes_personales}
                                onChange={handleChange}
                                placeholder="Ej: DM2 hace 10 años, HTA, dislipidemia..."
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="medicamentos_habituales" className="block text-sm font-medium text-gray-700">Medicamentos Habituales</label>
                            <textarea
                                name="medicamentos_habituales"
                                id="medicamentos_habituales"
                                rows={3}
                                value={formData.medicamentos_habituales}
                                onChange={handleChange}
                                placeholder="Ej: Metformina 850mg c/12h, Losartán 50mg/día..."
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label htmlFor="alergias" className="block text-sm font-medium text-gray-700">Alergias</label>
                            <textarea
                                name="alergias"
                                id="alergias"
                                rows={2}
                                value={formData.alergias}
                                onChange={handleChange}
                                placeholder="Ej: Penicilina, sulfas, AINES..."
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/pacientes')}
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

export default PacienteFormPage;
