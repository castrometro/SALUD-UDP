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
// Caso Clínico (entidad principal)
// ──────────────────────────────────────────────

export interface CasoClinico {
    id: number;
    titulo: string;
    descripcion: string;
    paciente: number;
    paciente_detail: Paciente | null;

    creado_por: number | null;
    creado_por_nombre: string | null;
    modificado_por: number | null;
    modificado_por_nombre: string | null;
    fecha_creacion: string;
    fecha_modificacion: string;

    total_estudiantes: number;
}

// ──────────────────────────────────────────────
// Ficha de Estudiante
// ──────────────────────────────────────────────

export interface FichaEstudiante {
    id: number;
    caso_clinico: number;
    caso_clinico_detail: CasoClinico | null;
    estudiante: number | null;
    estudiante_nombre: string | null;

    contenido: ContenidoClinico;

    // Fecha de atención pública (visible al estudiante, editable por el docente).
    // fecha_creacion es la fecha de registro real (solo lectura, uso interno).
    fecha_atencion: string | null;

    creado_por: number | null;
    creado_por_nombre: string | null;
    modificado_por: number | null;
    modificado_por_nombre: string | null;
    fecha_creacion: string;
    fecha_modificacion: string;

    total_versiones: number;
}

// ──────────────────────────────────────────────
// Historial de versiones
// ──────────────────────────────────────────────

export interface FichaHistorial {
    id: number;
    ficha: number;
    version: number;
    autor: number | null;
    autor_nombre: string | null;
    rol_autor: string;
    fecha: string;
    contenido: ContenidoClinico;
}
