import { useAuth } from "../contexts/AuthContext";

export default function Perfil() {

    const {
        usuario,
        carregando,
    } = useAuth();

    if (carregando) {
        return <p>Carregando...</p>;
    }

    if (!usuario) {
        return <p>Usuário não encontrado.</p>;
    }

    return (
        <main className="p-6">

            <h1 className="mb-6 text-2xl font-bold">
                Meu Perfil
            </h1>

            <div className="space-y-3">

                <p>
                    <strong>Nome:</strong>{" "}
                    {usuario.nome}
                </p>

                <p>
                    <strong>Email:</strong>{" "}
                    {usuario.email}
                </p>

                <p>
                    <strong>Telefone:</strong>{" "}
                    {usuario.telefone || "Não informado"}
                </p>

            </div>

        </main>
    );
}