import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import LoginPage from './features/auth/pages/LoginPage';
import HomePage from './pages/HomePage';
import MenuUsuarioPage from './pages/MenuUsuarioPage';
import Layout from './components/Layout';
import PacienteListPage from './features/pacientes/pages/PacienteListPage';
import PacienteFormPage from './features/pacientes/pages/PacienteFormPage';
import PacienteDetailPage from './features/pacientes/pages/PacienteDetailPage';
import FichaFormPage from './features/fichas/pages/FichaFormPage';
import FichaDetailPage from './features/fichas/pages/FichaDetailPage';
import EstudianteListPage from './features/estudiantes/pages/EstudianteListPage';
import EstudianteDetailPage from './features/estudiantes/pages/EstudianteDetailPage';
import EstudianteFormPage from './features/estudiantes/pages/EstudianteFormPage';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route
                        element={
                            <PrivateRoute>
                                <Layout />
                            </PrivateRoute>
                        }
                    >
                        <Route path="menu-usuario" element={<MenuUsuarioPage />} />

                        {/* Pacientes */}
                        <Route path="pacientes" element={<PacienteListPage />} />
                        <Route path="pacientes/nuevo" element={<PacienteFormPage />} />
                        <Route path="pacientes/:id" element={<PacienteDetailPage />} />
                        <Route path="pacientes/:id/editar" element={<PacienteFormPage />} />
                        {/* Fichas */}
                        <Route path="fichas/nueva" element={<FichaFormPage />} />
                        <Route path="fichas/:id" element={<FichaDetailPage />} />
                        <Route path="fichas/:id/editar" element={<FichaFormPage />} />

                        {/* Estudiantes */}
                        <Route path="estudiantes" element={<EstudianteListPage />} />
                        <Route path="estudiantes/nuevo" element={<EstudianteFormPage />} />
                        <Route path="estudiantes/:id" element={<EstudianteDetailPage />} />
                        <Route path="estudiantes/:id/editar" element={<EstudianteFormPage />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
