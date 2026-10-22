import { useAuth } from "../contexts/AuthContext";

export default function Home() {

  const { usuario, carregando } = useAuth();

  if (carregando) {
    return ("")
  }
  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold text-gray-900">
        Início
      </h1>

      {usuario && (
        <h2>
          Olá, {usuario.nome}!
        </h2>
      )}

    </div>
  );
}

