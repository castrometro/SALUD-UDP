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

// ──────────────────────────────────────────────
// Caso Clínico (escenario genérico, sin paciente)
// ──────────────────────────────────────────────

export interface CasoClinico {
    id: number;
    titulo: string;
    descripcion: string;

    creado_por: number | null;
    creado_por_nombre: string | null;
    modificado_por: number | null;
    modificado_por_nombre: string | null;
    fecha_creacion: string;
    fecha_modificacion: string;

    total_atenciones: number;
}

// ──────────────────────────────────────────────
// Atención Clínica (caso + paciente + fecha)
// ──────────────────────────────────────────────

export interface AtencionClinica {
    id: number;
    caso_clinico: number;
    caso_clinico_detail: CasoClinico | null;
    paciente: number;
    paciente_detail: Paciente | null;
    fecha_atencion: string;

    creado_por: number | null;
    creado_por_nombre: string | null;
    modificado_por: number | null;
    modificado_por_nombre: string | null;
    fecha_creacion: string;
    fecha_modificacion: string;

    total_estudiantes: number;
}

// ──────────────────────────────────────────────
// Atención Estudiante (asignación)
// ──────────────────────────────────────────────

export interface AtencionEstudiante {
    id: number;
    atencion_clinica: number;
    atencion_clinica_detail: AtencionClinica | null;
    estudiante: number | null;
    estudiante_nombre: string | null;
    asignado_por: number | null;
    asignado_por_nombre: string | null;
    fecha_asignacion: string;
    total_evoluciones: number;
}

// ──────────────────────────────────────────────
// Evolución (nota clínica)
// ──────────────────────────────────────────────

export type TipoAutor = 'ESTUDIANTE' | 'DOCENTE';

export interface Evolucion {
    id: number;
    atencion_estudiante: number;
    numero: number;
    contenido: ContenidoClinico;
    tipo_autor: TipoAutor;
    nombre_autor: string;
    creado_por: number | null;
    creado_por_nombre: string | null;
    fecha_creacion: string;
}
