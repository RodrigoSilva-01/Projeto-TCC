import { useAuth } from "../contexts/AuthContext";

export default function PainelAdmin() {
  const { usuario, ehAdministrador } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-[#1B3347]">
        Painel Administrativo
      </h1>

      <p className="mt-2 text-gray-600">
        Olá, {usuario?.nome || "usuário"}!
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1B3347]">
            Agendamentos
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Consulte e gerencie as solicitações dos tutores.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1B3347]">
            Pets
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Consulte os dados dos pets relacionados aos agendamentos.
          </p>
        </div>

        {ehAdministrador && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1B3347]">
              Configurações
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Gerencie as configurações da empresa.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
