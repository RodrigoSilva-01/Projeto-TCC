
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Home from "../pages/Home";

export default function RedirecionarUsuario({
    mostrarHomeCliente = false,
}) {
    const {
        sessao,
        vinculosEmpresa,
        carregando,
    } = useAuth();

    if (carregando) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <p className="text-gray-600">
                    Carregando seu perfil...
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

    const ehEquipe = vinculosEmpresa.some(
        (vinculo) =>
            vinculo.perfil === "admin" ||
            vinculo.perfil === "funcionario"
    );

    if (ehEquipe) {
        return <Navigate to="/admin" replace />;
    }

    if (mostrarHomeCliente) {
        return <Home />;
    }

    return <Navigate to="/" replace />;
}
