import { Paciente } from '../pacientes/types';

export interface FichaAmbulatoria {
    id: number;
    paciente: number; // ID
    paciente_detail?: Paciente; // From serializer
    
    // Tipo de ficha
    es_plantilla: boolean;
    ficha_base?: number; // ID de la ficha plantilla
    ficha_base_info?: {
        id: number;
        fecha_modificacion: string;
        modificado_por_nombre?: string;
    };
    estudiante?: number; // ID del estudiante dueño
    estudiante_nombre?: string;
    
    // Trazabilidad
    creado_por?: number;
    creado_por_nombre?: string;
    modificado_por?: number;
    modificado_por_nombre?: string;
    fecha_creacion?: string;
    fecha_modificacion?: string;
    total_versiones?: number;
    
    // Campos clínicos
    motivo_consulta: string;
    anamnesis: string;
    examen_fisico: string;
    diagnostico: string;
    intervenciones: string;
    factores: string;
    rau_necesidades: string;
    instrumentos_aplicados: string;
}

export interface FichaHistorial {
    id: number;
    ficha: number;
    version: number;
    modificado_por?: number;
    modificado_por_nombre?: string;
    fecha: string;
    
    // Snapshot de campos clínicos
    motivo_consulta: string;
    anamnesis: string;
    examen_fisico: string;
    diagnostico: string;
    intervenciones: string;
    factores: string;
    rau_necesidades: string;
    instrumentos_aplicados: string;
}
