/**
 * Servicio del portal estudiante.
 * Re-exporta funciones de fichaService relevantes y agrega helpers específicos.
 */
export {
    getAtencionesEstudiante,
    getAtencionEstudiante,
    getEvolucionesDeAsignacion,
    getVinetasDeAsignacion,
    crearEvolucion,
    getEvolucion,
    updateEvolucion,
    entregarEvolucion,
} from '@/features/fichas/services/fichaService';
