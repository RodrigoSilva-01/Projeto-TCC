
import { NavLink, useNavigate } from "react-router-dom";

import {
  House,
  PawPrint,
  CalendarCheck,
  Clock4,
  LogOut,
  User,
  LayoutDashboard,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { logoutUsuario } from "../services/authService";

export default function Sidebar() {
  const navigate = useNavigate();
  const { ehEquipe, ehAdministrador } = useAuth();

  async function handleLogout() {
    try {
      await logoutUsuario();
      navigate("/casapet104/login", { replace: true });
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  }

  const linksCliente = [
    {
      to: "/",
      text: "Home",
      icon: <House size={20} />,
    },
    {
      to: "/pets",
      text: "Pets",
      icon: <PawPrint size={20} />,
    },
    {
      to: "/agendamentos",
      text: "Agendamentos",
      icon: <CalendarCheck size={20} />,
    },
    {
      to: "/historico",
      text: "Histórico",
      icon: <Clock4 size={20} />,
    },
    {
      to: "/perfil",
      text: "Perfil",
      icon: <User size={20} />,
    },
  ];

  const linksEquipe = [
    {
      to: "/admin",
      text: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      to: "/admin/agendamentos",
      text: "Agendamentos",
      icon: <CalendarCheck size={20} />,
    },
  ];

  const links = ehEquipe ? linksEquipe : linksCliente;

  return (
    <aside className="fixed left-0 top-0 z-50 h-screen w-64">
      <nav className="flex h-full flex-col border-r border-gray-200 bg-white">
        <header className="flex items-center justify-center border-b border-gray-200 p-3">
          <img
            className="h-24 w-40 object-contain"
            src="/Logo.png"
            alt="Logo CasaPet104"
          />
        </header>

        <div className="border-b border-gray-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {ehEquipe ? "Área da equipe" : "Área do tutor"}
          </p>

          {ehAdministrador && (
            <p className="mt-1 text-sm font-medium text-[#1B3347]">
              Administrador
            </p>
          )}

          {!ehAdministrador && ehEquipe && (
            <p className="mt-1 text-sm font-medium text-[#1B3347]">
              Funcionário
            </p>
          )}
        </div>

        <ul className="flex-1 px-2 py-3">
          {links.map((link) => (
            <li key={link.to} className="my-1">
              <NavLink
                to={link.to}
                end={link.to === "/" || link.to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center rounded-md px-3 py-4 font-medium transition-colors ${isActive
                    ? "bg-gray-100 text-[#1B3347]"
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#1B3347]"
                  }`
                }
              >
                {link.icon}

                <span className="ml-3">
                  {link.text}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-200 px-2 py-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center rounded-md px-3 py-4 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut size={20} />

            <span className="ml-3">
              Sair
            </span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
