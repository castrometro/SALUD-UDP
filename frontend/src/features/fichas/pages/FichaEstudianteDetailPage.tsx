import { Navigate } from 'react-router-dom';

/**
 * @deprecated Reemplazado por AtencionDetailPage + EvolucionPage
 */
const FichaEstudianteDetailPage = () => {
    return <Navigate to="/casos-clinicos" replace />;
};

export default FichaEstudianteDetailPage;
