
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function EquipeRoute({
    children,
    apenasAdmin = false,
}) {
    const {
        sessao,
        carregando,
        ehEquipe,
        ehAdministrador,
    } = useAuth();

    if (carregando) {
        return (
            <div className="p-8 text-gray-600">
                Verificando permissões...
            </div>
        );
    }

    if (!sessao) {
        return (
            <Navigate
                to="/casapet104/login"
                replace
            />
        );
    }

    if (!ehEquipe) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    if (apenasAdmin && !ehAdministrador) {
        return (
            <Navigate
                to="/admin"
                replace
            />
        );
    }

    return children;
}
