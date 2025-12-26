import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const headerProps = {
        logoSrc: "/images/FacsyoLogo.png",
        logoAlt: "UDP Logo",
        menuItems: [{ text: "Inicio", link: "/" }, { text: "Menu Usuario", link: "/menu-usuario" }],
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
