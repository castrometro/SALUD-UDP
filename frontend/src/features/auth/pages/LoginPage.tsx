import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/menu-usuario'); // Redirect to menu-usuario after login
  };

  const headerProps = {
    logoSrc: "/images/FacsyoLogo.png",
    logoAlt: "UDP Logo",
    menuItems: [],
    circleButton: {
      text: "Volver a Inicio",
      link: "/"
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header {...headerProps} />
      <main className="flex-grow relative h-[500px] overflow-hidden">
        {/* Imagen de fondo ajustada */}
        <img
          src="/images/FacsyoGris.png"
          alt="Facultad de Salud y Odontología UDP"
          className="w-full h-full object-cover filter grayscale"
          style={{ objectPosition: "50% 30%" }} // Muestra la parte superior de la imagen
        />
        {/* Contenedor del formulario */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gray-300 p-10 rounded-3xl shadow-lg w-full max-w-sm flex flex-col items-center">
            <img
              src="/images/FacsyoLogo.png"
              alt="UDP Logo"
              className="h-12 mb-4"
            />
            <h2 className="font-arizona font-medium text-2xl text-center mb-6">
              Iniciar sesión
            </h2>
            <LoginForm onSuccess={handleSuccess} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
