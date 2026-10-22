
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
    const { sessao, carregando } = useAuth();

    if (carregando) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-600">
                    Verificando sua sessão...
                </p>
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

    return children;
}
