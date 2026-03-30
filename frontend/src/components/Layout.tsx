import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
    const { logout, isEstudiante } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuLink = isEstudiante ? '/mi-clinica' : '/menu-usuario';
    const menuLabel = isEstudiante ? 'Mi Clínica' : 'Menu Usuario';

    const headerProps = {
        logoSrc: "/images/FacsyoLogo.png",
        logoAlt: "UDP Logo",
        menuItems: [{ text: "Inicio", link: "/" }, { text: menuLabel, link: menuLink }],
        circleButton: {
            text: "Cerrar Sesión",
            onClick: handleLogout,
        },
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header {...headerProps} />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
