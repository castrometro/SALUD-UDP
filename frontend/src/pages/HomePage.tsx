import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Card from '../components/Card';
import { useAuth } from '../features/auth/context/AuthContext';

const cards = [
  {
    title: "Sobre el Proyecto",
    text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim",
    link: "/sobre-el-proyecto"
  },
  {
    title: "Seguridad de la información",
    text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim",
    link: "/seguridad-informacion"
  },
  {
    title: "Ayuda",
    text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim",
    link: "/ayuda"
  }
];

export default function HomePage() {
  const proyectoRef = useRef<HTMLDivElement>(null);
  const seguridadRef = useRef<HTMLDivElement>(null);
  const ayudaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const headerProps = {
    logoSrc: "/images/FacsyoLogo.png",
    logoAlt: "UDP Logo",
    menuItems: [
      { text: "INICIO", link: "/" },
      { text: "SOBRE EL PROYECTO", onClick: () => scrollToSection(proyectoRef) },
      { text: "SEGURIDAD DE LA INFORMACION", onClick: () => scrollToSection(seguridadRef) },
      { text: "AYUDA", onClick: () => scrollToSection(ayudaRef) },
    ],
    circleButton: isAuthenticated
      ? {
        text: "MENU",
        onClick: () => navigate('/menu-usuario')
      }
      : {
        text: "INICIAR SESIÓN",
        link: "/login"
      },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header {...headerProps} />
      <main className="flex-grow">
        <div className="relative w-full h-[500px]">
          <img
            src="/images/Facsyo.jpeg"
            alt="Facsyo"
            className="w-full h-full object-cover"
            style={{ objectPosition: "30% 20%" }}
          />
        </div>
        <div ref={proyectoRef}>
          <Card {...cards[0]} />
        </div>
        <div ref={seguridadRef}>
          <Card {...cards[1]} />
        </div>
        <div ref={ayudaRef}>
          <Card {...cards[2]} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
