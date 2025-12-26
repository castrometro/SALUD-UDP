import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paciente } from '../types';
import { createPaciente, getPaciente, updatePaciente } from '../services/pacienteService';
import { formatRut, validateRut } from '../../../utils/rut';

const PacienteFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Paciente>({
        id: 0, // Placeholder
        rut: '',
        nombre: '',
        apellido: '',
        prevision: '',
        correo: '',
        numero_telefono: '',
        fecha_nacimiento: '',
        domicilio: '',
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'rut') {
            setFormData(prev => ({ ...prev, [name]: formatRut(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
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
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
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
    );
};

export default PacienteFormPage;
