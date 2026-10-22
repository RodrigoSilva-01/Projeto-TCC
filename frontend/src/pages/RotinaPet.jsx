
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    buscarRotinaPet,
    salvarRotinaPet,
} from "../services/rotinaPetService";

const COR_PRINCIPAL = "#1B3347";

function CampoBooleano({ titulo, descricao, valor, onChange }) {
    return (
        <div className="space-y-3">
            <div>
                <p className="text-sm font-semibold text-gray-800">
                    {titulo}
                </p>

                {descricao && (
                    <p className="mt-1 text-sm text-gray-500">
                        {descricao}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    aria-pressed={valor === true}
                    onClick={() => onChange(true)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${valor === true
                            ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    Sim
                </button>

                <button
                    type="button"
                    aria-pressed={valor === false}
                    onClick={() => onChange(false)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${valor === false
                            ? "border-gray-500 bg-gray-100 text-gray-800 ring-2 ring-gray-200"
                            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    Não
                </button>
            </div>
        </div>
    );
}

function SecaoFormulario({ titulo, descricao, children }) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">
                    {titulo}
                </h2>

                {descricao && (
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                        {descricao}
                    </p>
                )}
            </div>

            {children}
        </section>
    );
}

function CampoTexto({
    label,
    name,
    value,
    onChange,
    placeholder,
}) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={name}
                className="block text-sm font-semibold text-gray-700"
            >
                {label}
            </label>

            <input
                id={name}
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10"
            />
        </div>
    );
}

function CampoAreaTexto({
    label,
    name,
    value,
    onChange,
    placeholder,
    rows = 4,
}) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={name}
                className="block text-sm font-semibold text-gray-700"
            >
                {label}
            </label>

            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                placeholder={placeholder}
                className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10"
            />
        </div>
    );
}

function criarFormularioInicial() {
    return {
        rotina: "",
        permitePasseio: false,
        ambienteHabitual: "",
        ficaSozinhoNoite: false,
        luzDuranteNoite: "",
    };
}

export default function RotinaPet() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState(
        criarFormularioInicial
    );

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarRotina() {
            setCarregando(true);
            setErro("");

            try {
                const dados = await buscarRotinaPet(id);

                if (!ativo) return;

                if (dados) {
                    setFormulario({
                        rotina: dados.rotina ?? "",
                        permitePasseio:
                            dados.permite_passeio ?? false,
                        ambienteHabitual:
                            dados.ambiente_habitual ?? "",
                        ficaSozinhoNoite:
                            dados.fica_sozinho_noite ?? false,
                        luzDuranteNoite:
                            dados.luz_durante_noite ?? "",
                    });
                } else {
                    setFormulario(criarFormularioInicial());
                }
            } catch (error) {
                console.error(
                    "Erro ao buscar rotina do pet:",
                    error
                );

                if (ativo) {
                    setErro(
                        "Não foi possível carregar as informações da rotina."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarRotina();

        return () => {
            ativo = false;
        };
    }, [id]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value,
        }));
    }

    function atualizarCampoBooleano(nome, valor) {
        setFormulario((anterior) => ({
            ...anterior,
            [nome]: valor,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSalvando(true);
        setErro("");

        try {
            await salvarRotinaPet({
                petId: id,
                rotina: formulario.rotina.trim() || null,
                permitePasseio: formulario.permitePasseio,
                ambienteHabitual:
                    formulario.ambienteHabitual.trim() || null,
                ficaSozinhoNoite: formulario.ficaSozinhoNoite,
                luzDuranteNoite:
                    formulario.luzDuranteNoite.trim() || null,
            });

            navigate(`/pets/${id}`);
        } catch (error) {
            console.error("Erro ao salvar rotina:", error);

            setErro(
                "Não foi possível salvar as informações. Tente novamente."
            );
        } finally {
            setSalvando(false);
        }
    }

    function voltarParaPet() {
        navigate(`/pets/${id}`);
    }

    if (carregando) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#1B3347]" />

                    <p className="text-sm font-medium text-gray-500">
                        Carregando informações da rotina...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/80 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-4xl">
                {/* Cabeçalho */}
                <header className="mb-8">
                    <button
                        type="button"
                        onClick={voltarParaPet}
                        className="mb-5 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-gray-600 transition hover:text-[#1B3347] focus:outline-none focus:ring-2 focus:ring-[#1B3347]/20"
                    >
                        <span aria-hidden="true">←</span>
                        Voltar para os detalhes do pet
                    </button>

                    <div
                        className="rounded-2xl p-6 text-white shadow-sm sm:p-8"
                        style={{ backgroundColor: COR_PRINCIPAL }}
                    >
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                            Informações do pet
                        </p>

                        <h1 className="text-2xl font-bold sm:text-3xl">
                            Rotina e hábitos
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                            Conte como é o dia a dia do seu pet para
                            ajudarmos a manter seus hábitos e seu
                            bem-estar durante a estadia.
                        </p>
                    </div>
                </header>

                {/* Mensagem de erro */}
                {erro && (
                    <div
                        role="alert"
                        className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <span className="font-bold">Atenção:</span>
                        <p>{erro}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rotina diária */}
                    <SecaoFormulario
                        titulo="Rotina diária"
                        descricao="Descreva os horários e os hábitos que fazem parte do dia a dia do seu pet."
                    >
                        <CampoAreaTexto
                            label="Como é a rotina do pet?"
                            name="rotina"
                            value={formulario.rotina}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Ex.: Acorda às 7h, faz as refeições às 8h e 18h, passeia à tarde e costuma dormir às 22h."
                        />
                    </SecaoFormulario>

                    {/* Passeios */}
                    <SecaoFormulario
                        titulo="Passeios"
                        descricao="Informe se o pet pode sair para passear."
                    >
                        <CampoBooleano
                            titulo="O pet pode fazer passeios?"
                            descricao="Considere as orientações e restrições habituais do pet."
                            valor={formulario.permitePasseio}
                            onChange={(valor) =>
                                atualizarCampoBooleano(
                                    "permitePasseio",
                                    valor
                                )
                            }
                        />
                    </SecaoFormulario>

                    {/* Ambiente habitual */}
                    <SecaoFormulario
                        titulo="Ambiente habitual"
                        descricao="Essas informações ajudam a entender onde o pet está mais acostumado a ficar."
                    >
                        <CampoTexto
                            label="Onde o pet costuma ficar?"
                            name="ambienteHabitual"
                            value={formulario.ambienteHabitual}
                            onChange={handleChange}
                            placeholder="Ex.: Dentro de casa, quintal, área externa..."
                        />
                    </SecaoFormulario>

                    {/* Período noturno */}
                    <SecaoFormulario
                        titulo="Hábitos durante a noite"
                        descricao="Conte um pouco sobre os hábitos do pet no período noturno."
                    >
                        <div className="space-y-6">
                            <CampoBooleano
                                titulo="O pet costuma ficar sozinho durante a noite?"
                                valor={formulario.ficaSozinhoNoite}
                                onChange={(valor) =>
                                    atualizarCampoBooleano(
                                        "ficaSozinhoNoite",
                                        valor
                                    )
                                }
                            />

                            <div className="border-t border-gray-100 pt-5">
                                <CampoTexto
                                    label="Como é a iluminação durante a noite?"
                                    name="luzDuranteNoite"
                                    value={formulario.luzDuranteNoite}
                                    onChange={handleChange}
                                    placeholder="Ex.: Luz acesa, luz fraca, ambiente escuro..."
                                />
                            </div>
                        </div>
                    </SecaoFormulario>

                    {/* Botões */}
                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={voltarParaPet}
                            disabled={salvando}
                            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={salvando}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                            style={{ backgroundColor: COR_PRINCIPAL }}
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
        </div>
    );
}
