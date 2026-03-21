import { useRef, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Card from '../components/Card';
import { useAuth } from '../features/auth/context/AuthContext';

const cards = [
  {
    title: "Sobre el Proyecto",
    text: "La Clínica de Simulación UDP es una plataforma digital diseñada para apoyar la formación clínica de estudiantes de la Facultad de Salud y Odontología. Permite a docentes crear casos clínicos que los estudiantes completan de forma independiente, facilitando el aprendizaje práctico en un entorno seguro y supervisado.",
    link: "#proyecto"
  },
  {
    title: "Seguridad de la información",
    text: "Toda la información de pacientes y fichas clínicas está protegida mediante autenticación segura con tokens JWT, control de acceso basado en roles (administrador, docente, estudiante) y cifrado en tránsito. El sistema cumple con las políticas de protección de datos personales de la Universidad Diego Portales.",
    link: "#seguridad"
  },
  {
    title: "Ayuda",
    text: "Si necesitas asistencia técnica o tienes dudas sobre el uso de la plataforma, contacta al equipo de soporte a través del Laboratorio de Tecnologías Educativas (LaTe). Para problemas de acceso, verifica tus credenciales o solicita una nueva contraseña a tu docente o administrador del sistema.",
    link: "#ayuda"
  }
];

export default function HomePage() {
  const proyectoRef = useRef<HTMLDivElement>(null);
  const seguridadRef = useRef<HTMLDivElement>(null);
  const ayudaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const scrollToSection = (ref: RefObject<HTMLDivElement>) => {
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
