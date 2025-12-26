import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FichaAmbulatoria } from '../types';
import { getFichas, deleteFicha } from '../services/fichaService';

const FichaListPage = () => {
    const [fichas, setFichas] = useState<FichaAmbulatoria[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFichas();
    }, []);

    const loadFichas = async () => {
        try {
            const data = await getFichas();
            setFichas(data);
        } catch (error) {
            console.error('Error loading fichas', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('¿Estás seguro de eliminar esta ficha?')) {
            try {
                await deleteFicha(id);
                loadFichas();
            } catch (error) {
                console.error('Error deleting ficha', error);
            }
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Fichas Ambulatorias</h1>
                <Link
                    to="/fichas/nueva"
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                    Nueva Ficha
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado Por</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {fichas.map((ficha) => (
                            <tr key={ficha.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ficha.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {ficha.paciente_detail ? `${ficha.paciente_detail.nombre} ${ficha.paciente_detail.apellido}` : ficha.paciente}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(ficha.fecha_creacion!).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ficha.creado_por_nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/fichas/${ficha.id}/editar`} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</Link>
                                    <button onClick={() => handleDelete(ficha.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FichaListPage;
