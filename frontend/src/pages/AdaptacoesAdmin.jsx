import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import {
    buscarAdaptacoesEmpresa,
    agendarAdaptacao,
    registrarPagamentoAdaptacao,
    concluirAdaptacao,
    cancelarAdaptacao,
} from "../services/adaptacaoPetService";

const EMPRESA_ID = "8f96d671-068a-4f4a-9e68-46fab2e67a7d";

const STATUS_LABELS = {
    pendente: "Pendente",
    agendada: "Agendada",
    concluida: "Concluída",
    cancelada: "Cancelada",
};

const STATUS_CLASSES = {
    pendente: "bg-amber-100 text-amber-800",
    agendada: "bg-blue-100 text-blue-800",
    concluida: "bg-green-100 text-green-800",
    cancelada: "bg-red-100 text-red-800",
};

function formatarData(data) {
    if (!data) return "Não definida";

    return new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return "—";

    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

export default function AdaptacoesAdmin() {
    const [adaptacoes, setAdaptacoes] = useState([]);
    const [formasPagamento, setFormasPagamento] = useState([]);
    const [pagamentos, setPagamentos] = useState([]);
    const [filtro, setFiltro] = useState("todas");

    const [adaptacaoSelecionada, setAdaptacaoSelecionada] = useState(null);
    const [dataAdaptacao, setDataAdaptacao] = useState("");
    const [horarioInicio, setHorarioInicio] = useState("10:00");
    const [horarioFim, setHorarioFim] = useState("11:00");
    const [observacoes, setObservacoes] = useState("");

    const [formaPagamentoId, setFormaPagamentoId] = useState("");
    const [observacoesPagamento, setObservacoesPagamento] = useState("");

    const [carregando, setCarregando] = useState(true);
    const [acaoEmAndamento, setAcaoEmAndamento] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const carregarDados = useCallback(async () => {
        setCarregando(true);
        setErro("");

        try {
            const [listaAdaptacoes, resultadoFormas] = await Promise.all([
                buscarAdaptacoesEmpresa(EMPRESA_ID),
                supabase
                    .from("formas_pagamento")
                    .select("id, nome")
                    .eq("empresa_id", EMPRESA_ID)
                    .eq("ativo", true)
                    .order("nome"),
            ]);

            if (resultadoFormas.error) {
                throw new Error(
                    `Erro ao buscar formas de pagamento: ${resultadoFormas.error.message}`
                );
            }

            setAdaptacoes(listaAdaptacoes);
            setFormasPagamento(resultadoFormas.data ?? []);

            if (resultadoFormas.data?.length) {
                setFormaPagamentoId((atual) =>
                    resultadoFormas.data.some((forma) => forma.id === atual)
                        ? atual
                        : resultadoFormas.data[0].id
                );
            } else {
                setFormaPagamentoId("");
            }

            if (listaAdaptacoes.length) {
                const ids = listaAdaptacoes.map((item) => item.id);

                const { data, error: erroPagamentos } = await supabase
                    .from("pagamentos")
                    .select(
                        "id, adaptacao_pet_id, status, valor, tipo, pago_em"
                    )
                    .in("adaptacao_pet_id", ids);

                if (erroPagamentos) {
                    throw new Error(
                        `Erro ao buscar pagamentos: ${erroPagamentos.message}`
                    );
                }

                setPagamentos(data ?? []);
            } else {
                setPagamentos([]);
            }
        } catch (error) {
            setErro(error.message || "Não foi possível carregar os dados.");
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    function abrirAgendamento(adaptacao) {
        setAdaptacaoSelecionada(adaptacao);
        setDataAdaptacao(adaptacao.data_adaptacao ?? "");
        setHorarioInicio(
            adaptacao.horario_inicio?.slice(0, 5) ?? "10:00"
        );
        setHorarioFim(
            adaptacao.horario_fim?.slice(0, 5) ?? "11:00"
        );
        setObservacoes(adaptacao.observacoes ?? "");
        setErro("");
        setSucesso("");
    }

    function fecharAgendamento() {
        setAdaptacaoSelecionada(null);
    }

    function buscarPagamento(adaptacaoId) {
        return pagamentos.find(
            (pagamento) => pagamento.adaptacao_pet_id === adaptacaoId
        );
    }

    async function executarAcao(acao, mensagemSucesso) {
        setAcaoEmAndamento(true);
        setErro("");
        setSucesso("");

        try {
            await acao();
            await carregarDados();
            setSucesso(mensagemSucesso);
        } catch (error) {
            setErro(error.message || "Não foi possível executar a operação.");
        } finally {
            setAcaoEmAndamento(false);
        }
    }

    async function salvarAgendamento(event) {
        event.preventDefault();

        if (!adaptacaoSelecionada) return;

        await executarAcao(async () => {
            await agendarAdaptacao({
                adaptacaoId: adaptacaoSelecionada.id,
                empresaId: EMPRESA_ID,
                dataAdaptacao,
                horarioInicio,
                horarioFim,
                observacoes,
            });

            fecharAgendamento();
        }, "Agendamento salvo com sucesso.");
    }

    async function registrarPagamento(adaptacao) {
        if (!formaPagamentoId) {
            setErro("Cadastre ou selecione uma forma de pagamento ativa.");
            return;
        }

        const confirmar = window.confirm(
            `Confirma que recebeu presencialmente o pagamento da adaptação de ${adaptacao.pet?.nome ?? "este pet"}?`
        );

        if (!confirmar) return;

        await executarAcao(async () => {
            await registrarPagamentoAdaptacao({
                adaptacaoId: adaptacao.id,
                formaPagamentoId,
                observacoes: observacoesPagamento,
            });

            setObservacoesPagamento("");
        }, "Pagamento registrado com sucesso.");
    }

    async function concluir(adaptacao) {
        const confirmar = window.confirm(
            `Confirma que a adaptação de ${adaptacao.pet?.nome ?? "este pet"} foi realizada e pode ser concluída?`
        );

        if (!confirmar) return;

        await executarAcao(
            () =>
                concluirAdaptacao({
                    adaptacaoId: adaptacao.id,
                    empresaId: EMPRESA_ID,
                }),
            "Adaptação concluída com sucesso."
        );
    }

    async function cancelar(adaptacao) {
        const confirmar = window.confirm(
            `Deseja realmente cancelar a adaptação de ${adaptacao.pet?.nome ?? "este pet"}?`
        );

        if (!confirmar) return;

        await executarAcao(
            () =>
                cancelarAdaptacao({
                    adaptacaoId: adaptacao.id,
                    empresaId: EMPRESA_ID,
                }),
            "Adaptação cancelada."
        );
    }

    const adaptacoesFiltradas = adaptacoes.filter((adaptacao) => {
        if (filtro === "todas") return true;
        return adaptacao.status === filtro;
    });

    const contagem = {
        todas: adaptacoes.length,
        pendente: adaptacoes.filter((item) => item.status === "pendente").length,
        agendada: adaptacoes.filter((item) => item.status === "agendada").length,
        concluida: adaptacoes.filter((item) => item.status === "concluida").length,
        cancelada: adaptacoes.filter((item) => item.status === "cancelada").length,
    };

    return (
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                            CasaPet104 · Área da equipe
                        </p>

                        <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
                            Adaptações dos pets
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Gerencie solicitações, agendamentos e pagamentos
                            das adaptações.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={carregarDados}
                        disabled={carregando || acaoEmAndamento}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                        Atualizar lista
                    </button>
                </header>

                {erro && (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                        {erro}
                    </div>
                )}

                {sucesso && (
                    <div
                        role="status"
                        className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                    >
                        {sucesso}
                    </div>
                )}

                <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                    {[
                        { id: "todas", titulo: "Todas" },
                        { id: "pendente", titulo: "Pendentes" },
                        { id: "agendada", titulo: "Agendadas" },
                        { id: "concluida", titulo: "Concluídas" },
                        { id: "cancelada", titulo: "Canceladas" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setFiltro(item.id)}
                            className={`rounded-xl border p-4 text-left transition ${filtro === item.id
                                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                        >
                            <p className="text-sm text-slate-500">
                                {item.titulo}
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-800">
                                {contagem[item.id]}
                            </p>
                        </button>
                    ))}
                </section>

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-5 py-4">
                        <h2 className="font-semibold text-slate-800">
                            Lista de adaptações
                        </h2>
                    </div>

                    {carregando ? (
                        <p className="p-8 text-center text-slate-500">
                            Carregando adaptações...
                        </p>
                    ) : adaptacoesFiltradas.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className="font-medium text-slate-700">
                                Nenhuma adaptação encontrada.
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                As solicitações aparecerão aqui quando forem
                                cadastradas.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {adaptacoesFiltradas.map((adaptacao) => {
                                const pagamento = buscarPagamento(adaptacao.id);
                                const pet = adaptacao.pet;
                                const tutor = pet?.tutor;

                                const pagamentoConfirmado =
                                    pagamento?.status === "pago";

                                const podeCancelar =
                                    ["pendente", "agendada"].includes(
                                        adaptacao.status
                                    ) && !pagamentoConfirmado;

                                return (
                                    <article
                                        key={adaptacao.id}
                                        className="space-y-4 p-5"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-bold text-slate-800">
                                                        {pet?.nome ??
                                                            "Pet não identificado"}
                                                    </h3>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[
                                                            adaptacao.status
                                                            ] ??
                                                            "bg-slate-100 text-slate-700"
                                                            }`}
                                                    >
                                                        {STATUS_LABELS[
                                                            adaptacao.status
                                                        ] ?? adaptacao.status}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {pet?.raca || "Raça não informada"}
                                                </p>

                                                <div className="mt-3 space-y-1 text-sm text-slate-600">
                                                    <p>
                                                        <strong>Tutor:</strong>{" "}
                                                        {tutor?.nome ??
                                                            "Não identificado"}
                                                    </p>

                                                    {tutor?.telefone && (
                                                        <p>
                                                            <strong>Telefone:</strong>{" "}
                                                            {tutor.telefone}
                                                        </p>
                                                    )}

                                                    {tutor?.email && (
                                                        <p>
                                                            <strong>E-mail:</strong>{" "}
                                                            {tutor.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-400">
                                                Solicitação:{" "}
                                                {formatarData(
                                                    adaptacao.created_at?.slice(0, 10)
                                                )}
                                            </p>
                                        </div>

                                        {adaptacao.status !== "pendente" && (
                                            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                                                <p>
                                                    <strong>Data:</strong>{" "}
                                                    {formatarData(
                                                        adaptacao.data_adaptacao
                                                    )}
                                                </p>

                                                <p className="mt-1">
                                                    <strong>Horário:</strong>{" "}
                                                    {adaptacao.horario_inicio?.slice(0, 5) ??
                                                        "—"}{" "}
                                                    até{" "}
                                                    {adaptacao.horario_fim?.slice(0, 5) ??
                                                        "—"}
                                                </p>

                                                {adaptacao.observacoes && (
                                                    <p className="mt-2">
                                                        <strong>Observações:</strong>{" "}
                                                        {adaptacao.observacoes}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {adaptacao.status === "agendada" && (
                                            <div className="rounded-lg border border-slate-200 p-4">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="font-semibold text-slate-800">
                                                            Pagamento da adaptação
                                                        </p>

                                                        {pagamentoConfirmado ? (
                                                            <p className="mt-1 text-sm text-green-700">
                                                                Recebimento registrado:{" "}
                                                                {formatarMoeda(
                                                                    pagamento.valor
                                                                )}
                                                            </p>
                                                        ) : (
                                                            <p className="mt-1 text-sm text-amber-700">
                                                                Pagamento ainda não registrado.
                                                            </p>
                                                        )}
                                                    </div>

                                                    {!pagamentoConfirmado &&
                                                        formasPagamento.length > 0 && (
                                                            <div className="flex flex-col gap-2 sm:min-w-64">
                                                                <label
                                                                    htmlFor={`forma-${adaptacao.id}`}
                                                                    className="text-sm font-medium text-slate-700"
                                                                >
                                                                    Forma de pagamento
                                                                </label>

                                                                <select
                                                                    id={`forma-${adaptacao.id}`}
                                                                    value={formaPagamentoId}
                                                                    onChange={(event) =>
                                                                        setFormaPagamentoId(
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                                                                >
                                                                    {formasPagamento.map(
                                                                        (forma) => (
                                                                            <option
                                                                                key={forma.id}
                                                                                value={forma.id}
                                                                            >
                                                                                {forma.nome}
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </select>

                                                                <label
                                                                    htmlFor={`obs-pagamento-${adaptacao.id}`}
                                                                    className="text-sm font-medium text-slate-700"
                                                                >
                                                                    Observações do recebimento
                                                                </label>

                                                                <input
                                                                    id={`obs-pagamento-${adaptacao.id}`}
                                                                    value={observacoesPagamento}
                                                                    onChange={(event) =>
                                                                        setObservacoesPagamento(
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    placeholder="Opcional"
                                                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                                                />

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        acaoEmAndamento ||
                                                                        !formaPagamentoId
                                                                    }
                                                                    onClick={() =>
                                                                        registrarPagamento(
                                                                            adaptacao
                                                                        )
                                                                    }
                                                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                                                >
                                                                    Registrar recebimento
                                                                </button>
                                                            </div>
                                                        )}

                                                    {!pagamentoConfirmado &&
                                                        formasPagamento.length === 0 && (
                                                            <p className="text-sm text-amber-700">
                                                                Cadastre uma forma
                                                                de pagamento ativa
                                                                nas configurações
                                                                da empresa.
                                                            </p>
                                                        )}
                                                </div>

                                                {pagamentoConfirmado && (
                                                    <p className="mt-3 text-xs text-slate-500">
                                                        Recebimento confirmado em:{" "}
                                                        {pagamento.pago_em
                                                            ? new Date(
                                                                pagamento.pago_em
                                                            ).toLocaleString("pt-BR")
                                                            : "Data não informada"}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            {["pendente", "agendada"].includes(
                                                adaptacao.status
                                            ) && (
                                                    <button
                                                        type="button"
                                                        disabled={acaoEmAndamento}
                                                        onClick={() =>
                                                            abrirAgendamento(adaptacao)
                                                        }
                                                        className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                                                    >
                                                        {adaptacao.status === "agendada"
                                                            ? "Reagendar"
                                                            : "Agendar adaptação"}
                                                    </button>
                                                )}

                                            {adaptacao.status === "agendada" && (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        acaoEmAndamento ||
                                                        !pagamentoConfirmado
                                                    }
                                                    onClick={() => concluir(adaptacao)}
                                                    className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                    title={
                                                        !pagamentoConfirmado
                                                            ? "Registre o pagamento antes de concluir."
                                                            : "Concluir adaptação"
                                                    }
                                                >
                                                    Concluir adaptação
                                                </button>
                                            )}

                                            {podeCancelar && (
                                                <button
                                                    type="button"
                                                    disabled={acaoEmAndamento}
                                                    onClick={() => cancelar(adaptacao)}
                                                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {adaptacaoSelecionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-agendamento"
                        className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="mb-5 flex items-start justify-between gap-3">
                            <div>
                                <h2
                                    id="titulo-agendamento"
                                    className="text-xl font-bold text-slate-800"
                                >
                                    Agendar adaptação
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Pet:{" "}
                                    {adaptacaoSelecionada.pet?.nome ??
                                        "Não identificado"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fecharAgendamento}
                                disabled={acaoEmAndamento}
                                aria-label="Fechar formulário"
                                className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={salvarAgendamento} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="data-adaptacao"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Data
                                </label>

                                <input
                                    id="data-adaptacao"
                                    type="date"
                                    value={dataAdaptacao}
                                    onChange={(event) =>
                                        setDataAdaptacao(event.target.value)
                                    }
                                    min={new Date().toLocaleDateString("en-CA")}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label
                                        htmlFor="hora-inicio"
                                        className="mb-1 block text-sm font-medium text-slate-700"
                                    >
                                        Horário inicial
                                    </label>

                                    <input
                                        id="hora-inicio"
                                        type="time"
                                        value={horarioInicio}
                                        onChange={(event) =>
                                            setHorarioInicio(event.target.value)
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="hora-fim"
                                        className="mb-1 block text-sm font-medium text-slate-700"
                                    >
                                        Horário final
                                    </label>

                                    <input
                                        id="hora-fim"
                                        type="time"
                                        value={horarioFim}
                                        onChange={(event) =>
                                            setHorarioFim(event.target.value)
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="observacoes-adaptacao"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Observações
                                </label>

                                <textarea
                                    id="observacoes-adaptacao"
                                    rows={3}
                                    value={observacoes}
                                    onChange={(event) =>
                                        setObservacoes(event.target.value)
                                    }
                                    placeholder="Informações sobre a adaptação..."
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={fecharAgendamento}
                                    disabled={acaoEmAndamento}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                                >
                                    Voltar
                                </button>

                                <button
                                    type="submit"
                                    disabled={acaoEmAndamento}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {acaoEmAndamento
                                        ? "Salvando..."
                                        : "Salvar agendamento"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
