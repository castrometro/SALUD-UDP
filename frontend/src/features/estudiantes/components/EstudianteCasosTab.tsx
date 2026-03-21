import { useMemo, type FC } from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar } from 'lucide-react';
import { FichaAmbulatoria } from '../../fichas/types';
import { formatRut } from '@/utils/rut';
import { Paciente } from '../../pacientes/types';

interface EstudianteCasosTabProps {
    fichas: FichaAmbulatoria[];
}

interface Caso {
    paciente: Paciente;
    ultimaAtencion: string;
    totalFichas: number;
}

const EstudianteCasosTab: FC<EstudianteCasosTabProps> = ({ fichas }) => {

    const casos = useMemo(() => {
        const casosMap = new Map<number, Caso>();

        fichas.forEach(ficha => {
            if (!ficha.paciente_detail) return;

            const current = casosMap.get(ficha.paciente_detail.id);
            const fechaFicha = ficha.fecha_creacion || '';

            if (current) {
                casosMap.set(ficha.paciente_detail.id, {
                    ...current,
                    ultimaAtencion: fechaFicha > current.ultimaAtencion ? fechaFicha : current.ultimaAtencion,
                    totalFichas: current.totalFichas + 1
                });
            } else {
                casosMap.set(ficha.paciente_detail.id, {
                    paciente: ficha.paciente_detail,
                    ultimaAtencion: fechaFicha,
                    totalFichas: 1
                });
            }
        });

        return Array.from(casosMap.values()).sort((a, b) =>
            new Date(b.ultimaAtencion).getTime() - new Date(a.ultimaAtencion).getTime()
        );
    }, [fichas]);

    if (casos.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-worksans">No se han registrado casos clínicos aún.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {casos.map((caso) => (
                <div key={caso.paciente.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 font-arizona">
                                    {caso.paciente.nombre} {caso.paciente.apellido}
                                </h3>
                                <p className="text-sm text-gray-500 font-worksans">
                                    {formatRut(caso.paciente.rut)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 space-y-3">
                        <div className="flex items-center text-sm text-gray-600 font-worksans">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            <span>Última atención: {caso.ultimaAtencion ? new Date(caso.ultimaAtencion).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {caso.totalFichas} {caso.totalFichas === 1 ? 'ficha' : 'fichas'}
                            </span>
                            <Link
                                to={`/pacientes/${caso.paciente.id}`}
                                className="text-sm font-medium text-aqua hover:text-blue-600 transition-colors"
                            >
                                Ver Detalle
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EstudianteCasosTab;
