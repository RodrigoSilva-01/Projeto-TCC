
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    buscarComportamentoPet,
    salvarComportamentoPet,
} from "../services/comportamentoPetService";

const COR_PRINCIPAL = "#1B3347";

const formularioInicial = {
    socializaAnimais: null,
    socializaPessoas: null,
    comportamentoComidaAnimais: "",
    comportamentoComidaPessoas: "",
    aceitaCarinho: null,
    aceitaColo: null,
    comportamentoAgressivo: null,
    situacoesAgressividade: "",
    timidoAnsioso: null,
    gostaBrincadeiras: null,
    aceitaPetiscos: null,
    destroiObjetos: null,
    observacoes: "",
};

const camposBooleanos = [
    "socializaAnimais",
    "socializaPessoas",
    "aceitaCarinho",
    "aceitaColo",
    "comportamentoAgressivo",
    "timidoAnsioso",
    "gostaBrincadeiras",
    "aceitaPetiscos",
    "destroiObjetos",
];

function CampoBooleano({ label, name, value, onChange, descricao }) {
    return (
        <fieldset className="space-y-3">
            <legend className="text-sm font-semibold leading-6 text-gray-800">
                {label}
            </legend>

            {descricao && (
                <p className="text-sm leading-5 text-gray-500">
                    {descricao}
                </p>
            )}

            <div className="grid grid-cols-3 gap-2">
                {[
                    { texto: "Sim", valor: "true" },
                    { texto: "Não", valor: "false" },
                    { texto: "Não informado", valor: "" },
                ].map((opcao) => {
                    const selecionado =
                        (value === null && opcao.valor === "") ||
                        (value === true && opcao.valor === "true") ||
                        (value === false && opcao.valor === "false");

                    return (
                        <button
                            key={opcao.texto}
                            type="button"
                            aria-pressed={selecionado}
                            onClick={() =>
                                onChange({
                                    target: {
                                        name,
                                        value: opcao.valor,
                                    },
                                })
                            }
                            className={`rounded-xl border px-2 py-3 text-xs font-semibold transition sm:px-3 sm:text-sm ${selecionado
                                    ? opcao.valor === "true"
                                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100"
                                        : opcao.valor === "false"
                                            ? "border-gray-500 bg-gray-100 text-gray-800 ring-2 ring-gray-200"
                                            : "border-[#1B3347] bg-slate-50 text-[#1B3347] ring-2 ring-slate-100"
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {opcao.texto}
                        </button>
                    );
                })}
            </div>
        </fieldset>
    );
}

function CampoTexto({
    label,
    name,
    value,
    onChange,
    placeholder,
    textarea = false,
    rows = 4,
}) {
    const classes =
        "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10";

    return (
        <div className="space-y-2">
            <label
                htmlFor={name}
                className="block text-sm font-semibold text-gray-700"
            >
                {label}
            </label>

            {textarea ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={rows}
                    className={`${classes} resize-y`}
                />
            ) : (
                <input
                    id={name}
                    name={name}
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={classes}
                />
            )}
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

export default function ComportamentoPet() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState(formularioInicial);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarComportamento() {
            setCarregando(true);
            setErro("");

            try {
                const dados = await buscarComportamentoPet(id);

                if (!ativo) return;

                if (dados) {
                    setFormulario({
                        socializaAnimais:
                            dados.socializa_animais ?? null,
                        socializaPessoas:
                            dados.socializa_pessoas ?? null,
                        comportamentoComidaAnimais:
                            dados.comportamento_comida_animais ?? "",
                        comportamentoComidaPessoas:
                            dados.comportamento_comida_pessoas ?? "",
                        aceitaCarinho:
                            dados.aceita_carinho ?? null,
                        aceitaColo:
                            dados.aceita_colo ?? null,
                        comportamentoAgressivo:
                            dados.comportamento_agressivo ?? null,
                        situacoesAgressividade:
                            dados.situacoes_agressividade ?? "",
                        timidoAnsioso:
                            dados.timido_ansioso ?? null,
                        gostaBrincadeiras:
                            dados.gosta_brincadeiras ?? null,
                        aceitaPetiscos:
                            dados.aceita_petiscos ?? null,
                        destroiObjetos:
                            dados.destroi_objetos ?? null,
                        observacoes: dados.observacoes ?? "",
                    });
                } else {
                    setFormulario(formularioInicial);
                }
            } catch (error) {
                console.error(
                    "Erro ao carregar comportamento do pet:",
                    error
                );

                if (ativo) {
                    setErro(
                        "Não foi possível carregar as informações de comportamento."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        if (!id) {
            setErro("Não foi possível identificar o pet.");
            setCarregando(false);
            return () => {
                ativo = false;
            };
        }

        carregarComportamento();

        return () => {
            ativo = false;
        };
    }, [id]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: camposBooleanos.includes(name)
                ? value === ""
                    ? null
                    : value === "true"
                : value,
        }));

        setErro("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!id) {
            setErro("Não foi possível identificar o pet.");
            return;
        }

        setSalvando(true);
        setErro("");

        try {
            await salvarComportamentoPet({
                petId: id,
                ...formulario,
            });

            navigate(`/pets/${id}`);
        } catch (error) {
            console.error(
                "Erro ao salvar comportamento do pet:",
                error
            );

            setErro(
                "Não foi possível salvar as informações. Verifique sua conexão e tente novamente."
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
                        Carregando informações de comportamento...
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
                            Comportamento e personalidade
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                            Conte como seu pet interage com pessoas e
                            outros animais, quais são suas preferências
                            e como costuma reagir em diferentes situações.
                        </p>
                    </div>
                </header>

                {erro && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <p className="font-semibold">
                            Não foi possível concluir a operação
                        </p>
                        <p className="mt-1">{erro}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Socialização */}
                    <SecaoFormulario
                        titulo="Socialização"
                        descricao="Ajude a equipe a entender como o pet interage com outras pessoas e animais."
                    >
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <CampoBooleano
                                label="Socializa com outros animais?"
                                name="socializaAnimais"
                                value={formulario.socializaAnimais}
                                onChange={handleChange}
                            />

                            <CampoBooleano
                                label="Socializa com pessoas?"
                                name="socializaPessoas"
                                value={formulario.socializaPessoas}
                                onChange={handleChange}
                            />
                        </div>
                    </SecaoFormulario>

                    {/* Alimentação */}
                    <SecaoFormulario
                        titulo="Comportamento durante a alimentação"
                        descricao="Descreva como o pet reage quando está comendo perto de outras pessoas ou animais."
                    >
                        <div className="space-y-5">
                            <CampoTexto
                                label="Perto de outros animais"
                                name="comportamentoComidaAnimais"
                                value={formulario.comportamentoComidaAnimais}
                                onChange={handleChange}
                                placeholder="Ex.: Come tranquilamente, protege a comida, rosna quando outro animal se aproxima..."
                                textarea
                            />

                            <CampoTexto
                                label="Perto de pessoas"
                                name="comportamentoComidaPessoas"
                                value={formulario.comportamentoComidaPessoas}
                                onChange={handleChange}
                                placeholder="Ex.: Aceita a presença de pessoas, fica agitado, não gosta que mexam na comida..."
                                textarea
                            />
                        </div>
                    </SecaoFormulario>

                    {/* Contato e reações */}
                    <SecaoFormulario
                        titulo="Contato e reações"
                        descricao="Essas respostas ajudam a equipe a respeitar os limites e as necessidades do pet."
                    >
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <CampoBooleano
                                label="Aceita carinho?"
                                name="aceitaCarinho"
                                value={formulario.aceitaCarinho}
                                onChange={handleChange}
                            />

                            <CampoBooleano
                                label="Aceita colo?"
                                name="aceitaColo"
                                value={formulario.aceitaColo}
                                onChange={handleChange}
                            />

                            <CampoBooleano
                                label="Apresenta comportamento agressivo?"
                                name="comportamentoAgressivo"
                                value={formulario.comportamentoAgressivo}
                                onChange={handleChange}
                                descricao="Considere reações como rosnar, avançar ou tentar morder."
                            />

                            <CampoBooleano
                                label="É tímido ou ansioso?"
                                name="timidoAnsioso"
                                value={formulario.timidoAnsioso}
                                onChange={handleChange}
                            />
                        </div>

                        {formulario.comportamentoAgressivo === true && (
                            <div className="mt-6 border-t border-gray-100 pt-5">
                                <CampoTexto
                                    label="Em quais situações apresenta essas reações?"
                                    name="situacoesAgressividade"
                                    value={formulario.situacoesAgressividade}
                                    onChange={handleChange}
                                    placeholder="Ex.: Quando sente medo, durante a alimentação, ao ser manuseado..."
                                    textarea
                                />
                            </div>
                        )}
                    </SecaoFormulario>

                    {/* Preferências e hábitos */}
                    <SecaoFormulario
                        titulo="Preferências e hábitos"
                        descricao="Conhecer as preferências do pet ajuda a tornar a estadia mais agradável."
                    >
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <CampoBooleano
                                label="Gosta de brincadeiras?"
                                name="gostaBrincadeiras"
                                value={formulario.gostaBrincadeiras}
                                onChange={handleChange}
                            />

                            <CampoBooleano
                                label="Aceita petiscos?"
                                name="aceitaPetiscos"
                                value={formulario.aceitaPetiscos}
                                onChange={handleChange}
                            />

                            <CampoBooleano
                                label="Costuma destruir objetos?"
                                name="destroiObjetos"
                                value={formulario.destroiObjetos}
                                onChange={handleChange}
                            />
                        </div>
                    </SecaoFormulario>

                    {/* Observações */}
                    <SecaoFormulario
                        titulo="Observações adicionais"
                        descricao="Registre outras informações que possam ajudar a equipe a cuidar melhor do pet."
                    >
                        <CampoTexto
                            label="Outras informações sobre o comportamento"
                            name="observacoes"
                            value={formulario.observacoes}
                            onChange={handleChange}
                            placeholder="Conte algo importante sobre o comportamento, os medos, as preferências ou os hábitos do seu pet..."
                            textarea
                            rows={5}
                        />
                    </SecaoFormulario>

                    {/* Ações */}
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
