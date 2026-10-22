import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { buscarEmergenciaPet, salvarEmergenciaPet } from "../services/emergenciaPetService";

const CORES = {
    principal: "#1B3347",
    fundo: "#F4F7FA",
};

const dadosIniciais = {
    nome_contato: "",
    telefone_contato: "",
    veterinario: "",
    telefone_veterinario: "",
    autoriza_primeiros_socorros: "",
};

function CampoTexto({
    id,
    label,
    name,
    value,
    onChange,
    placeholder,
    maxLength = 150,
    type = "text",
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-semibold text-gray-700"
            >
                {label}
            </label>

            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={maxLength}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1B3347] focus:ring-4 focus:ring-[#1B3347]/10"
            />
        </div>
    );
}

function OpcaoAutorizacao({ value, selecionado, onChange, children }) {
    const ativa = selecionado === value;

    return (
        <label
            className={`flex cursor - pointer items - start gap - 3 rounded - xl border p - 4 transition ${
    ativa
        ? "border-[#1B3347] bg-[#1B3347]/5 ring-2 ring-[#1B3347]/10"
        : "border-gray-200 bg-white hover:border-gray-300"
} `}
        >
            <input
                type="radio"
                name="autoriza_primeiros_socorros"
                value={value}
                checked={ativa}
                onChange={onChange}
                required
                className="mt-1 h-4 w-4 accent-[#1B3347]"
            />

            <span>
                <span className="block text-sm font-semibold text-gray-800">
                    {children}
                </span>

                <span className="mt-1 block text-xs text-gray-500">
                    {value === "true"
                        ? "Permite os primeiros socorros em uma emergência."
                        : "Não concede essa autorização."}
                </span>
            </span>
        </label>
    );
}

export default function EmergenciaPet() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [dados, setDados] = useState(dadosIniciais);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarDados() {
            try {
                setCarregando(true);
                setErro("");

                const resultado = await buscarEmergenciaPet(id);

                if (!ativo) return;

                if (resultado) {
                    setDados({
                        nome_contato: resultado.nome_contato ?? "",
                        telefone_contato: resultado.telefone_contato ?? "",
                        veterinario: resultado.veterinario ?? "",
                        telefone_veterinario:
                            resultado.telefone_veterinario ?? "",
                        autoriza_primeiros_socorros:
                            resultado.autoriza_primeiros_socorros == null
                                ? ""
                                : String(
                                      resultado.autoriza_primeiros_socorros
                                  ),
                    });
                } else {
                    setDados(dadosIniciais);
                }
            } catch (error) {
                if (ativo) {
                    setErro( error.message || "Não foi possível carregar as informações de emergência.");
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarDados();

        return () => {
            ativo = false;
        };
    }, [id]);

    function handleChange(event) {
        const { name, value } = event.target;

        setDados((anterior) => ({
            ...anterior,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");

        if ( dados.autoriza_primeiros_socorros !== "true" && dados.autoriza_primeiros_socorros !== "false") {
            setErro(
                "Informe se o tutor autoriza os primeiros socorros."
            );
            return;
        }

        setSalvando(true);

        try {
            await salvarEmergenciaPet(id, {
                nome_contato: dados.nome_contato.trim() || null,
                telefone_contato: dados.telefone_contato.trim() || null,
                veterinario: dados.veterinario.trim() || null,
                telefone_veterinario:
                    dados.telefone_veterinario.trim() || null,
                autoriza_primeiros_socorros:
                    dados.autoriza_primeiros_socorros === "true",
            });

            navigate(`/pets/${id}`, {
                state: {
                    mensagem:
                        "Informações de emergência salvas com sucesso.",
                },
            });
        } catch (error) {
            setErro(
                error.message ||
                    "Não foi possível salvar as informações de emergência."
            );
        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return (
            <main
                className="flex min-h-[60vh] items-center justify-center p-6"
                style={{ backgroundColor: CORES.fundo }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#1B3347]" />

                    <p className="text-sm text-gray-500">
                        Carregando informações de emergência...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main
            className="min-h-screen px-4 py-6 sm:px-6 lg:px-8"
            style={{ backgroundColor: CORES.fundo }}
        >
            <div className="mx-auto max-w-4xl">
                <Link
                    to={`/pets/${id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#1B3347]"
                >
                    <span aria-hidden="true">←</span>
                    Voltar para os detalhes do pet
                </Link>

                {/* Cabeçalho */}
                <header
                    className="mt-5 overflow-hidden rounded-2xl p-6 text-white shadow-sm sm:p-8"
                    style={{ backgroundColor: CORES.principal }}
                >
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
                            🆘
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                                Cadastro do pet
                            </p>

                            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                                Contatos de emergência
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                                Mantenha os contatos importantes registrados
                                para que a equipe saiba quem acionar em uma
                                situação de emergência.
                            </p>
                        </div>
                    </div>
                </header>

                {erro && (
                    <div
                        role="alert"
                        className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <span aria-hidden="true">⚠️</span>
                        <p>{erro}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    {/* Contato de emergência */}
                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                        <div className="mb-6 flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                                📞
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Contato de emergência
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Pessoa que poderá ser contatada caso
                                    aconteça algo com o pet.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <CampoTexto
                                id="nome_contato"
                                name="nome_contato"
                                label="Nome do contato"
                                value={dados.nome_contato}
                                onChange={handleChange}
                                placeholder="Nome completo"
                            />

                            <CampoTexto
                                id="telefone_contato"
                                name="telefone_contato"
                                label="Telefone do contato"
                                type="tel"
                                value={dados.telefone_contato}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                                maxLength={30}
                            />
                        </div>
                    </section>

                    {/* Veterinário */}
                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                        <div className="mb-6 flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                                🩺
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Veterinário de referência
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Dados do profissional que acompanha o pet,
                                    se houver.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <CampoTexto
                                id="veterinario"
                                name="veterinario"
                                label="Nome do veterinário"
                                value={dados.veterinario}
                                onChange={handleChange}
                                placeholder="Nome do profissional"
                            />

                            <CampoTexto
                                id="telefone_veterinario"
                                name="telefone_veterinario"
                                label="Telefone do veterinário"
                                type="tel"
                                value={dados.telefone_veterinario}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                                maxLength={30}
                            />
                        </div>
                    </section>

                    {/* Autorização */}
                    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                        <div className="mb-5 flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl">
                                🛡️
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Autorização para primeiros socorros
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-gray-500">
                                    O tutor autoriza os primeiros socorros em
                                    uma situação de emergência?
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <OpcaoAutorizacao
                                value="true"
                                selecionado={
                                    dados.autoriza_primeiros_socorros
                                }
                                onChange={handleChange}
                            >
                                Sim, autorizo
                            </OpcaoAutorizacao>

                            <OpcaoAutorizacao
                                value="false"
                                selecionado={
                                    dados.autoriza_primeiros_socorros
                                }
                                onChange={handleChange}
                            >
                                Não autorizo
                            </OpcaoAutorizacao>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-gray-400">
                            Selecione uma opção para continuar. Esta
                            autorização deve seguir os procedimentos e os
                            limites de atendimento definidos pelo
                            estabelecimento.
                        </p>
                    </section>

                    {/* Ações */}
                    <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">
                        <Link
                            to={`/pets/${id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={salvando}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3347] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#27465F] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {salvando && (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            )}

                            {salvando
                                ? "Salvando informações..."
                                : "Salvar informações"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
