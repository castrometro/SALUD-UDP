import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FichaAmbulatoria } from '../types';
import { createFicha, getFicha, updateFicha } from '../services/fichaService';
import PacienteSelect from '../components/PacienteSelect';

const FichaFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Partial<FichaAmbulatoria>>({
        paciente: undefined,
        motivo_consulta: '',
        anamnesis: '',
        examen_fisico: '',
        diagnostico: '',
        intervenciones: '',
        factores: '',
        rau_necesidades: '',
        instrumentos_aplicados: '',
    });

    useEffect(() => {
        if (isEdit && id) {
            loadFicha(Number(id));
        }
    }, [isEdit, id]);

    const loadFicha = async (id: number) => {
        try {
            const data = await getFicha(id);
            setFormData(data);
        } catch (error) {
            console.error('Error loading ficha', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEdit && id) {
                await updateFicha(Number(id), formData);
            } else {
                await createFicha(formData);
            }
            navigate('/fichas');
        } catch (error) {
            console.error('Error saving ficha', error);
            alert('Error al guardar la ficha');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                {isEdit ? 'Editar Ficha' : 'Nueva Ficha'}
            </h1>
            
            <form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg p-6 space-y-6">
                
                <div className="mb-4">
                    <label htmlFor="paciente" className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
                    <PacienteSelect
                        value={formData.paciente}
                        onChange={(id) => setFormData(prev => ({ ...prev, paciente: id }))}
                        disabled={isEdit}
                    />
                </div>

                <div>
                    <label htmlFor="motivo_consulta" className="block text-sm font-medium text-gray-700">Motivo de Consulta</label>
                    <textarea
                        name="motivo_consulta"
                        id="motivo_consulta"
                        rows={3}
                        value={formData.motivo_consulta}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="anamnesis" className="block text-sm font-medium text-gray-700">Anamnesis</label>
                    <textarea
                        name="anamnesis"
                        id="anamnesis"
                        rows={4}
                        value={formData.anamnesis}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="examen_fisico" className="block text-sm font-medium text-gray-700">Examen Físico</label>
                    <textarea
                        name="examen_fisico"
                        id="examen_fisico"
                        rows={4}
                        value={formData.examen_fisico}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="diagnostico" className="block text-sm font-medium text-gray-700">Diagnóstico</label>
                    <textarea
                        name="diagnostico"
                        id="diagnostico"
                        rows={3}
                        value={formData.diagnostico}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="intervenciones" className="block text-sm font-medium text-gray-700">Intervenciones</label>
                    <textarea
                        name="intervenciones"
                        id="intervenciones"
                        rows={3}
                        value={formData.intervenciones}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/fichas')}
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
