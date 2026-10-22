import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function GuestRoute({ children }) {
    const { sessao, carregando } = useAuth();

    if (carregando) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-gray-600">
                    Carregando...
                </p>
            </div>
        );
    }

    if (sessao) {
        return (
            <Navigate
                to="/redirecionar"
                replace
            />
        );
    }

    return children;
}
