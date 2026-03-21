import { Paciente } from '../pacientes/types';

export interface ContenidoClinico {
    motivo_consulta: string;
    anamnesis: string;
    examen_fisico: string;
    diagnostico: string;
    intervenciones: string;
    factores: string;
    rau_necesidades: string;
    instrumentos_aplicados: string;
    [key: string]: string;
}

export const CONTENIDO_DEFAULT: ContenidoClinico = {
    motivo_consulta: '',
    anamnesis: '',
    examen_fisico: '',
    diagnostico: '',
    intervenciones: '',
    factores: '',
    rau_necesidades: '',
    instrumentos_aplicados: '',
};

export interface FichaBaseInfo {
    id: number;
    fecha_modificacion: string;
    modificado_por_nombre?: string | null;
}

export interface FichaAmbulatoria {
    id: number;
    paciente: number;
    paciente_detail?: Paciente;

    es_plantilla: boolean;
    ficha_base: number | null;
    ficha_base_info: FichaBaseInfo | null;
    estudiante: number | null;
    estudiante_nombre?: string | null;

    contenido: ContenidoClinico;

    creado_por?: number | null;
    creado_por_nombre?: string | null;
    modificado_por?: number | null;
    modificado_por_nombre?: string | null;
    fecha_creacion?: string;
    fecha_modificacion?: string;
    total_versiones?: number;
}

export interface FichaHistorial {
    id: number;
    ficha: number;
    version: number;
    autor?: number;
    autor_nombre?: string;
    rol_autor?: string;
    fecha: string;
    contenido: ContenidoClinico;
}
