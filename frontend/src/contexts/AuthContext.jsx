import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { buscarUsuarioAtual, buscarVinculosEmpresa } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [sessao, setSessao] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [vinculosEmpresa, setVinculoEmpresa] = useState([]);
    const [autenticacaoInicializada, setAutenticacaoInicializada] = useState(false);

    const ultimoUsuarioAuthId = useRef(null);

    const atualizarVinculosEmpresa = useCallback(async () => {
        const usuarioAtual = await buscarUsuarioAtual();
        const vinculos = await buscarVinculosEmpresa(usuarioAtual.id);

        setUsuario(usuarioAtual);
        setVinculoEmpresa(vinculos);

        return vinculos;
    }, []);

    // Observa os eventos de autenticação.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const novoId = session?.user?.id ?? null;
                const idAnterior = ultimoUsuarioAuthId.current;

                ultimoUsuarioAuthId.current = novoId;

                setSessao(session);
                setAutenticacaoInicializada(true);

                if (!session) {
                    setUsuario(null);
                    setVinculoEmpresa([]);
                    setCarregando(false);
                } else if (novoId !== idAnterior) {
                    setCarregando(true);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Busca o perfil fora do callback de autenticação.
    useEffect(() => {
        if (!autenticacaoInicializada) {
            return;
        }

        let ativo = true;

        async function carregarPerfil() {
            if (!sessao?.user?.id) {
                setUsuario(null);
                setVinculoEmpresa([]);
                setCarregando(false);
                return;
            }

            setCarregando(true);

            try {
                const usuarioAtual = await buscarUsuarioAtual();
                const vinculos = await buscarVinculosEmpresa(usuarioAtual.id);

                if (ativo) {
                    setUsuario(usuarioAtual);
                    setVinculoEmpresa(vinculos);
                }
            } catch (error) {
                console.error("Erro ao carregar usuário e vínculos:",error);

                if (ativo) {
                    setUsuario(null);
                    setVinculoEmpresa([]);
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarPerfil();

        return () => {ativo = false};
    }, [autenticacaoInicializada, sessao?.user?.id]);

    const ehAdministrador = vinculosEmpresa.some(vinculo => vinculo.perfil === "admin");
    const ehFuncionario = vinculosEmpresa.some(vinculo => vinculo.perfil === "funcionario");

    const ehEquipe = ehAdministrador || ehFuncionario;

    return (
        <AuthContext.Provider
            value={{
                sessao,
                usuario,
                vinculosEmpresa,
                ehAdministrador,
                ehFuncionario,
                ehEquipe,
                carregando,
                atualizarVinculosEmpresa,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
