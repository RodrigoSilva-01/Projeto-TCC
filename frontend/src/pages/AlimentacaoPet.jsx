
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    buscarAlimentacaoPet,
    salvarAlimentacaoPet,
} from "../services/alimentacaoPetService";

const COR_PRINCIPAL = "#1B3347";

function CampoTexto({
    id,
    nome,
    titulo,
    descricao,
    valor,
    onChange,
    placeholder,
    tipo = "text",
    min,
    erro,
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-sm font-semibold text-gray-800"
            >
                {titulo}
            </label>

            {descricao && (
                <p className="mt-1 text-sm leading-5 text-gray-500">
                    {descricao}
                </p>
            )}

            <input
                id={id}
                name={nome}
                type={tipo}
                min={min}
                value={valor}
                onChange={onChange}
                placeholder={placeholder}
                aria-invalid={Boolean(erro)}
                aria-describedby={erro ? `${id}-erro` : undefined}
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-[#1B3347]/15 ${erro
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-[#1B3347]"
                    }`}
            />

            {erro && (
                <p id={`${id}-erro`} className="mt-1 text-sm text-red-600">
                    {erro}
                </p>
            )}
        </div>
    );
}

function CampoAreaTexto({
    id,
    nome,
    titulo,
    descricao,
    valor,
    onChange,
    placeholder,
    linhas = 4,
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-sm font-semibold text-gray-800"
            >
                {titulo}
            </label>

            {descricao && (
                <p className="mt-1 text-sm leading-5 text-gray-500">
                    {descricao}
                </p>
            )}

            <textarea
                id={id}
                name={nome}
                value={valor}
                onChange={onChange}
                rows={linhas}
                placeholder={placeholder}
                className="mt-2 w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/15"
            />
        </div>
    );
}

function SecaoFormulario({ icone, titulo, descricao, children }) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">
                    {icone}
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        {titulo}
                    </h2>

                    {descricao && (
                        <p className="mt-1 text-sm leading-5 text-gray-500">
                            {descricao}
                        </p>
                    )}
                </div>
            </div>

            {children}
        </section>
    );
}

function criarFormularioInicial() {
    return {
        quantidadeRefeicoes: "",
        horariosRefeicoes: "",
        quantidadePorRefeicao: "",
        alergias: "",
        restricoesAlimentares: "",
        observacoes: "",
    };
}

export default function AlimentacaoPet() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState(criarFormularioInicial);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [erroQuantidade, setErroQuantidade] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarAlimentacao() {
            setCarregando(true);
            setErro("");
            setFormulario(criarFormularioInicial());

            try {
                const dados = await buscarAlimentacaoPet(id);

                if (!ativo) return;

                if (dados) {
                    setFormulario({
                        quantidadeRefeicoes:
                            dados.quantidade_refeicoes ?? "",

                        horariosRefeicoes:
                            dados.horarios_refeicoes ?? "",

                        quantidadePorRefeicao:
                            dados.quantidade_por_refeicao ?? "",

                        alergias: dados.alergias ?? "",

                        restricoesAlimentares:
                            dados.restricoes_alimentares ?? "",

                        observacoes: dados.observacoes ?? "",
                    });
                }
            } catch (error) {
                console.error(
                    "Erro ao carregar alimentação do pet:",
                    error
                );

                if (ativo) {
                    setErro(
                        "Não foi possível carregar as informações de alimentação."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarAlimentacao();

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

        if (name === "quantidadeRefeicoes") {
            setErroQuantidade("");
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (salvando) return;

        setErro("");
        setErroQuantidade("");

        const quantidade = formulario.quantidadeRefeicoes.trim();

        if (
            quantidade !== "" &&
            (!Number.isInteger(Number(quantidade)) ||
                Number(quantidade) < 1)
        ) {
            setErroQuantidade(
                "Informe um número inteiro maior que zero."
            );
            return;
        }

        setSalvando(true);

        try {
            await salvarAlimentacaoPet({
                petId: id,

                quantidadeRefeicoes:
                    quantidade !== "" ? Number(quantidade) : null,

                horariosRefeicoes:
                    formulario.horariosRefeicoes.trim() || null,

                quantidadePorRefeicao:
                    formulario.quantidadePorRefeicao.trim() || null,

                alergias: formulario.alergias.trim() || null,

                restricoesAlimentares:
                    formulario.restricoesAlimentares.trim() || null,

                observacoes: formulario.observacoes.trim() || null,
            });

            navigate(`/pets/${id}`);
        } catch (error) {
            console.error(
                "Erro ao salvar alimentação do pet:",
                error
            );

            setErro(
                "Não foi possível salvar as informações de alimentação. Tente novamente."
            );
        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                <div className="text-center">
                    <div
                        className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#1B3347]"
                        role="status"
                        aria-label="Carregando"
                    />

                    <p className="mt-4 text-sm text-gray-600">
                        Carregando informações de alimentação...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <Link
                    to={`/pets/${id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#1B3347] transition hover:underline"
                >
                    <span aria-hidden="true">←</span>
                    Voltar para o pet
                </Link>

                <header className="mt-5 rounded-2xl bg-[#1B3347] p-6 text-white shadow-sm sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
                            🍽️
                        </div>

                        <div>
                            <p className="text-sm font-medium text-white/70">
                                Cadastro do pet
                            </p>

                            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                                Alimentação do pet
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                                Registre os horários, as quantidades e as
                                restrições alimentares para ajudar a manter
                                a rotina do seu pet durante a hospedagem
                                ou a creche.
                            </p>
                        </div>
                    </div>
                </header>

                {erro && (
                    <div
                        role="alert"
                        className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                        <span aria-hidden="true" className="text-lg">
                            ⚠️
                        </span>

                        <p>{erro}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <SecaoFormulario
                        icone="🕒"
                        titulo="Rotina de alimentação"
                        descricao="Informe como as refeições são distribuídas ao longo do dia."
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <CampoTexto
                                id="quantidadeRefeicoes"
                                nome="quantidadeRefeicoes"
                                titulo="Refeições por dia"
                                descricao="Quantas vezes o pet come diariamente?"
                                tipo="number"
                                min="1"
                                valor={formulario.quantidadeRefeicoes}
                                onChange={handleChange}
                                placeholder="Ex.: 3"
                                erro={erroQuantidade}
                            />

                            <CampoTexto
                                id="horariosRefeicoes"
                                nome="horariosRefeicoes"
                                titulo="Horários das refeições"
                                descricao="Informe os horários habituais."
                                valor={formulario.horariosRefeicoes}
                                onChange={handleChange}
                                placeholder="Ex.: 08:00, 13:00 e 18:00"
                            />
                        </div>

                        <div className="mt-5">
                            <CampoTexto
                                id="quantidadePorRefeicao"
                                nome="quantidadePorRefeicao"
                                titulo="Quantidade por refeição"
                                descricao="Informe a porção e a unidade utilizada."
                                valor={formulario.quantidadePorRefeicao}
                                onChange={handleChange}
                                placeholder="Ex.: 150 g de ração por refeição"
                            />
                        </div>

                        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <p className="text-sm leading-6 text-blue-900">
                                <strong>Importante:</strong> registre a
                                quantidade habitual indicada pelo tutor,
                                incluindo a unidade de medida, para facilitar
                                os cuidados com a alimentação.
                            </p>
                        </div>
                    </SecaoFormulario>

                    <SecaoFormulario
                        icone="🥣"
                        titulo="Alergias e restrições"
                        descricao="Registre os alimentos que devem ser evitados e os cuidados necessários."
                    >
                        <div className="space-y-5">
                            <CampoAreaTexto
                                id="alergias"
                                nome="alergias"
                                titulo="Alergias alimentares"
                                descricao="Informe alergias conhecidas e os detalhes fornecidos pelo tutor."
                                valor={formulario.alergias}
                                onChange={handleChange}
                                placeholder="Ex.: alergia a determinado ingrediente..."
                                linhas={3}
                            />

                            <CampoAreaTexto
                                id="restricoesAlimentares"
                                nome="restricoesAlimentares"
                                titulo="Restrições alimentares"
                                descricao="Inclua alimentos proibidos, dietas especiais ou outras restrições."
                                valor={formulario.restricoesAlimentares}
                                onChange={handleChange}
                                placeholder="Ex.: não oferecer petiscos específicos..."
                                linhas={3}
                            />
                        </div>
                    </SecaoFormulario>

                    <SecaoFormulario
                        icone="📝"
                        titulo="Observações adicionais"
                        descricao="Adicione outros detalhes importantes sobre a rotina alimentar."
                    >
                        <CampoAreaTexto
                            id="observacoes"
                            nome="observacoes"
                            titulo="Observações"
                            descricao="Este campo é opcional."
                            valor={formulario.observacoes}
                            onChange={handleChange}
                            placeholder="Ex.: precisa de supervisão durante as refeições ou tem alguma preferência alimentar..."
                            linhas={4}
                        />
                    </SecaoFormulario>

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                        <Link
                            to={`/pets/${id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={salvando}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3347] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#27465e] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {salvando && (
                                <span
                                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                                    aria-hidden="true"
                                />
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