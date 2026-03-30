import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { AtencionEstudiante } from '../../fichas/types';
import { formatRut } from '@/utils/rut';

import Pagination from '@/components/ui/Pagination';

interface EstudianteFichasTabProps {
    fichas: AtencionEstudiante[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

const EstudianteFichasTab: FC<EstudianteFichasTabProps> = ({ fichas, pagination }) => {
    if (fichas.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-worksans">No hay asignaciones registradas para este estudiante.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                Fecha Asignación
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                Paciente
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                Evoluciones
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-worksans">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {fichas.map((asig) => {
                            const paciente = asig.atencion_clinica_detail?.paciente_detail;
                            return (
                                <tr key={asig.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-worksans">
                                        {new Date(asig.fecha_asignacion).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 font-worksans">
                                                {paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente desconocido'}
                                            </span>
                                            <span className="text-xs text-gray-500 font-worksans">
                                                {paciente ? formatRut(paciente.rut) : ''}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-worksans">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {asig.total_evoluciones}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            to={`/atenciones/${asig.atencion_clinica}`}
                                            className="text-gray-400 hover:text-blue-600 transition-colors inline-block"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="px-4 py-3 border-t border-gray-200">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.onPageChange}
                        hasNext={pagination.hasNext}
                        hasPrevious={pagination.hasPrevious}
                    />
                </div>
            )}
        </div>
    );
};

export default EstudianteFichasTab;
