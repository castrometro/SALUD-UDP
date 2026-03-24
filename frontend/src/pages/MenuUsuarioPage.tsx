import { AdminCard } from '../components/AdminCard';
import { useAuth } from '../features/auth/context/AuthContext';

export default function MenuUsuarioPage() {
  const { user } = useAuth();

  const cards = [];
  const isAdmin = user?.role === 'ADMIN';
  const isDocente = user?.role === 'DOCENTE';
  const isEstudiante = user?.role === 'ESTUDIANTE';

  if (isAdmin || isDocente || isEstudiante) {
    cards.push({ title: "Gestión de Pacientes", link: "/pacientes" });
  }

  if (isAdmin || isDocente) {
    cards.push({ title: "Gestión de Estudiantes", link: "/estudiantes" });
  }

  if (isAdmin || isDocente) {
    cards.push({ title: "Casos Clínicos", link: "/plantillas" });
  }

  return (
    <>
      <div className="relative">
        <img
          src="/images/PanelAdmin.png"
          alt="Panel de Administración"
          className="w-full h-[500px] object-cover"
        />
        <div className="absolute inset-0 flex items-center h-[500px]">
          <h1 className="font-arizona font-bold text-6xl mb-4 md:mb-0 md:w-1/3 ml-40">
            Panel de<br />administración
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <AdminCard key={index} {...card} />
          ))}
        </div>
      </div>
    </>
  );
}
