import { Paciente } from '../pacientes/types';

export interface FichaAmbulatoria {
    id: number;
    paciente: number; // ID
    paciente_detail?: Paciente; // From serializer
    creado_por?: number;
    creado_por_nombre?: string;
    fecha_creacion?: string;
    fecha_modificacion?: string;
    
    motivo_consulta: string;
    anamnesis: string;
    examen_fisico: string;
    diagnostico: string;
    intervenciones: string;
    factores: string;
    rau_necesidades: string;
    instrumentos_aplicados: string;
}
