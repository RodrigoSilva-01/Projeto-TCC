import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import { cadastrarUsuario, vincularUsuarioEmpresaPorSlug } from "../services/authService";

function AuthCard({ children }) {
    return (
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
            {children}
        </div>
    );
}

function AuthInput({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    required = false,
}) {
    return (
        <div className="flex flex-col gap-1.5">

            <label
                htmlFor={name}
                className="text-sm font-medium text-gray-700"
            >
                {label}
            </label>

            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

        </div>
    );
}

function AuthButton({
    children,
    disabled = false,
}) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {children}
        </button>
    );
}

export default function Cadastro() {

    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const { slug } = useParams();
    const navigate = useNavigate();
    const { atualizarVinculosEmpresa } = useAuth();


    async function handleSubmit(event) {

        event.preventDefault();

        setErro("");

        try {
            setCarregando(true);

            await cadastrarUsuario({ nome, telefone, email, senha, slug });

            if (data.session && slug) {
                await vincularUsuarioEmpresaPorSlug(slug);
                await atualizarVinculosEmpresa();

                navigate("/redirecionar", { replace: true });
                return;
            }

            if (!data.session && slug) {
                alert(
                    "Cadastro realizado! Confirme seu e-mail e depois entre pelo link desta empresa."
                );

                return;
            }
            alert("Cadastro realizado com sucesso!");

        } catch (error) {
            setErro(error.message);

        } finally {
            setCarregando(false);

        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

            <AuthCard>

                <h1 className="mb-6 text-2xl font-bold">
                    Criar conta
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <AuthInput
                        label="Nome"
                        name="nome"
                        value={nome}
                        onChange={(event) =>
                            setNome(event.target.value)
                        }
                        placeholder="Digite seu nome"
                        required
                    />

                    <AuthInput
                        label="Telefone"
                        type="tel"
                        name="telefone"
                        value={telefone}
                        onChange={(event) =>
                            setTelefone(event.target.value)
                        }
                        placeholder="Digite seu telefone"
                        required
                    />

                    <AuthInput
                        label="E-mail"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        placeholder="Digite seu e-mail"
                        required
                    />

                    <AuthInput
                        label="Senha"
                        type="password"
                        name="senha"
                        value={senha}
                        onChange={(event) =>
                            setSenha(event.target.value)
                        }
                        placeholder="Digite sua senha"
                        required
                    />

                    {erro && (
                        <p className="text-sm text-red-500">
                            {erro}
                        </p>
                    )}

                    <AuthButton disabled={carregando}>
                        {carregando
                            ? "Cadastrando..."
                            : "Cadastrar"}
                    </AuthButton>

                </form>

                <div className="mt-5 border-t border-gray-200 pt-4 text-center">

                    <p className="text-sm text-gray-600">
                        Já possui uma conta?
                    </p>

                    <Link to={slug ? `/${slug}/login` : "/login"}
                        className="mt-1 inline-block font-medium text-blue-600 hover:underline">
                        Faça login
                    </Link>
                </div>

            </AuthCard>

        </div>
    );
}

