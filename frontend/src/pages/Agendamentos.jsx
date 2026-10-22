
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { buscarServicos, buscarPets, criarAgendamento } from "../services/agendamentoService";

const CORES = {
    principal: "#1B3347",
    fundo: "#F4F7FA",
};

const formularioInicial = {
    servico_id: "",
    pet_id: "",
    data_inicio: "",
    horario_inicio: "",
    data_fim: "",
    horario_fim: "",
    primeira_hospedagem: false,
    adaptacao_realizada: false,
    observacoes: "",
};

function obterDataLocal() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function calcularQuantidade(formulario, formaCobranca) {
    const {
        data_inicio,
        horario_inicio,
        data_fim,
        horario_fim,
    } = formulario;

    if (!data_inicio || !data_fim) {
        return 0;
    }

    const inicio = new Date(
        `${data_inicio}T${horario_inicio || "00:00"}:00`
    );

    const fim = new Date(
        `${data_fim}T${horario_fim || "00:00"}:00`
    );

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
        return 0;
    }

    if (fim <= inicio) {
        return 0;
    }

    const diferencaHoras =
        (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60);

    switch (formaCobranca) {
        case "diaria": {
            const inicioDia = new Date(
                `${data_inicio}T00:00:00`
            );

            const fimDia = new Date(
                `${data_fim}T00:00:00`
            );

            const diferencaDias = Math.round(
                (fimDia.getTime() - inicioDia.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            // Uma saída no mesmo dia corresponde a uma diária.
            return Math.max(1, diferencaDias);
        }

        case "hora":
            return Math.ceil(diferencaHoras);

        case "visita":
        case "passeio":
        case "fixo":
            return 1;

        default:
            return 0;
    }
}

function Campo({
    id,
    label,
    type = "text",
    value,
    onChange,
    required = false,
    min,
    max,
    placeholder,
    children,
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-2 block text-sm font-semibold text-gray-700"
            >
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>

            {children ? (
                children
            ) : (
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    required={required}
                    min={min}
                    max={max}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1B3347] focus:ring-4 focus:ring-[#1B3347]/10"
                />
            )}
        </div>
    );
}

function Secao({ icone, titulo, descricao, children }) {
    return (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1B3347]/5 text-xl">
                    {icone}
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-800">
                        {titulo}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                        {descricao}
                    </p>
                </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                {children}
            </div>
        </section>
    );
}

export default function Agendamentos() {
    const navigate = useNavigate();

    const [servicos, setServicos] = useState([]);
    const [pets, setPets] = useState([]);

    const [usuarioId, setUsuarioId] = useState(null);
    const [empresaId, setEmpresaId] = useState(null);

    const [configuracoes, setConfiguracoes] = useState({
        valor_adaptacao: 50,
        percentual_sinal: 30,
        sinal_obrigatorio: true,
    });

    const [formulario, setFormulario] = useState(formularioInicial);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarDados() {
            try {
                setCarregando(true);
                setErro("");

                const {
                    data: { user },
                    error: authError,
                } = await supabase.auth.getUser();

                if (authError) {
                    throw new Error(authError.message);
                }

                if (!user) {
                    throw new Error(
                        "Sua sessão não foi encontrada. Entre novamente na sua conta."
                    );
                }

                const { data: usuario, error: usuarioError } =
                    await supabase
                        .from("usuarios")
                        .select("id")
                        .eq("auth_user_id", user.id)
                        .single();

                if (usuarioError) {
                    throw new Error(
                        `Erro ao localizar seu cadastro: ${usuarioError.message}`
                    );
                }


                const { data: vinculos, error: vinculoError } = await supabase
                    .from("empresa_usuarios")
                    .select("empresa_id, perfil, ativo")
                    .eq("usuario_id", usuario.id)
                    .eq("ativo", true);

                if (vinculoError) {
                    throw new Error(
                        `Erro ao localizar os vínculos com empresas: ${vinculoError.message}`
                    );
                }

                if (!vinculos || vinculos.length === 0) {
                    throw new Error(
                        "Sua conta ainda não está vinculada à CasaPet104. Entre em contato com a equipe para regularizar seu cadastro."
                    );
                }

                if (vinculos.length > 1) {
                    throw new Error(
                        "Sua conta possui vínculos com mais de uma empresa. É necessário identificar qual empresa você deseja agendar."
                    );
                }

                const vinculo = vinculos[0];


                const [
                    servicosData,
                    petsData,
                    configuracoesResultado,
                ] = await Promise.all([
                    buscarServicos(vinculo.empresa_id),
                    buscarPets(usuario.id),
                    supabase
                        .from("configuracoes_empresa")
                        .select(
                            "valor_adaptacao, percentual_sinal, sinal_obrigatorio"
                        )
                        .eq("empresa_id", vinculo.empresa_id)
                        .maybeSingle(),
                ]);

                if (configuracoesResultado.error) {
                    throw new Error(
                        `Erro ao buscar configurações de cobrança: ${configuracoesResultado.error.message}`
                    );
                }

                if (!ativo) return;

                setUsuarioId(usuario.id);
                setEmpresaId(vinculo.empresa_id);
                setServicos(servicosData);
                setPets(petsData);

                if (configuracoesResultado.data) {
                    setConfiguracoes((anterior) => ({
                        ...anterior,
                        ...configuracoesResultado.data,
                    }));
                }
            } catch (error) {
                if (ativo) {
                    console.error(
                        "Erro ao carregar agendamento:",
                        error
                    );

                    setErro(
                        error.message ||
                        "Não foi possível carregar os dados."
                    );
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
    }, []);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: type === "checkbox" ? checked : value,
        }));

        setErro("");
    }

    const servicoSelecionado = useMemo(
        () =>
            servicos.find(
                (servico) => servico.id === formulario.servico_id
            ) ?? null,
        [servicos, formulario.servico_id]
    );

    const petSelecionado = useMemo(
        () =>
            pets.find((pet) => pet.id === formulario.pet_id) ?? null,
        [pets, formulario.pet_id]
    );

    const ehHospedagem = useMemo(() => {
        if (!servicoSelecionado) return false;

        const tipo = String(servicoSelecionado.tipo || "").toLowerCase();
        const nome = String(servicoSelecionado.nome || "").toLowerCase();

        return (
            tipo.includes("hospedagem") ||
            nome.includes("hospedagem") ||
            nome.includes("hospedação")
        );
    }, [servicoSelecionado]);

    const quantidade = calcularQuantidade(
        formulario,
        servicoSelecionado?.forma_cobranca
    );

    const valorUnitario = Number(servicoSelecionado?.preco || 0);

    const valorServico = valorUnitario * quantidade;

    const precisaAdaptacao =
        ehHospedagem &&
        formulario.primeira_hospedagem &&
        !formulario.adaptacao_realizada;

    const valorAdaptacao = precisaAdaptacao
        ? Number(configuracoes.valor_adaptacao || 0)
        : 0;

    const valorTotal = valorServico + valorAdaptacao;

    const valorSinal = ehHospedagem
        ? valorTotal *
        (Number(configuracoes.percentual_sinal ?? 30) / 100)
        : 0;

    const dataMinimaFim =
        formulario.data_inicio || obterDataLocal();

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");

        if (!usuarioId || !empresaId) {
            setErro(
                "Não foi possível identificar seu usuário ou sua empresa. Entre novamente na sua conta."
            );
            return;
        }

        if (!servicoSelecionado || !petSelecionado) {
            setErro("Selecione um serviço e um pet.");
            return;
        }

        if (quantidade <= 0) {
            setErro(
                "Confira as datas e os horários. A saída precisa acontecer depois da entrada."
            );
            return;
        }

        if (ehHospedagem && formulario.primeira_hospedagem &&
            !formulario.adaptacao_realizada) {
            setErro(
                "Esta é a primeira hospedagem e a adaptação ainda não foi realizada. Entre em contato com a equipe para combinar a adaptação antes de confirmar a hospedagem."
            );
            return;
        }

        setSalvando(true);

        try {
            const novoAgendamento = await criarAgendamento({
                empresa_id: empresaId,
                usuario_id: usuarioId,
                pet_id: petSelecionado.id,
                servico_id: servicoSelecionado.id,

                data_inicio: formulario.data_inicio,
                horario_inicio: formulario.horario_inicio,
                data_fim: formulario.data_fim,
                horario_fim: formulario.horario_fim,

                quantidade,
                valor_unitario: valorUnitario,
                valor_total: valorTotal,

                valor_sinal:
                    ehHospedagem && configuracoes.sinal_obrigatorio
                        ? valorSinal
                        : 0,

                primeira_hospedagem:
                    ehHospedagem && formulario.primeira_hospedagem,

                adaptacao_realizada:
                    ehHospedagem && formulario.adaptacao_realizada,

                observacoes: formulario.observacoes.trim() || null,
            });

            navigate("/historico", {
                state: {
                    mensagem:
                        "Solicitação enviada! Aguarde a análise da equipe.",
                    agendamentoId: novoAgendamento.id,
                },
            });
        } catch (error) {
            console.error("Erro ao criar agendamento:", error);

            setErro(
                error.message ||
                "Não foi possível enviar a solicitação. Tente novamente."
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
                        Carregando serviços e pets...
                    </p>
                </div>
            </main>
        );
    }

    if (erro && !servicos.length && !pets.length) {
        return (
            <main
                className="flex min-h-[60vh] items-center justify-center px-4 py-8"
                style={{ backgroundColor: CORES.fundo }}
            >
                <div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
                    <div className="text-3xl">⚠️</div>

                    <h1 className="mt-3 text-xl font-bold text-gray-800">
                        Não foi possível carregar os dados
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-red-600">
                        {erro}
                    </p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-5 rounded-xl bg-[#1B3347] px-5 py-3 text-sm font-semibold text-white hover:bg-[#27465F]"
                    >
                        Tentar novamente
                    </button>
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
                    to="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#1B3347]"
                >
                    <span aria-hidden="true">←</span>
                    Voltar ao início
                </Link>

                <header
                    className="mt-5 rounded-2xl p-6 text-white shadow-sm sm:p-8"
                    style={{ backgroundColor: CORES.principal }}
                >
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                        CasaPet104
                    </p>

                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                        Novo agendamento
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                        Escolha o serviço, selecione seu pet e informe o
                        período desejado. A equipe analisará sua solicitação.
                    </p>
                </header>

                {erro && (
                    <div
                        role="alert"
                        className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <p className="font-semibold">
                            Não foi possível continuar
                        </p>
                        <p className="mt-1">{erro}</p>
                    </div>
                )}

                {!servicos.length && (
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Não há serviços ativos disponíveis para sua empresa.
                        Entre em contato com a equipe.
                    </div>
                )}

                {!pets.length && (
                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        Você ainda não tem pets cadastrados.{" "}
                        <Link
                            to="/pets"
                            className="font-semibold underline"
                        >
                            Cadastrar pet
                        </Link>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <Secao
                        icone="🐾"
                        titulo="Serviço e pet"
                        descricao="Escolha o serviço desejado e o pet que receberá o atendimento."
                    >
                        <Campo
                            id="servico_id"
                            label="Serviço"
                            value={formulario.servico_id}
                            onChange={handleChange}
                            required
                        >
                            <select
                                id="servico_id"
                                name="servico_id"
                                value={formulario.servico_id}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1B3347] focus:ring-4 focus:ring-[#1B3347]/10"
                            >
                                <option value="" disabled>
                                    Selecione um serviço
                                </option>

                                {servicos.map((servico) => (
                                    <option
                                        key={servico.id}
                                        value={servico.id}
                                    >
                                        {servico.nome} —{" "}
                                        {formatarMoeda(servico.preco)}{" "}
                                        {servico.forma_cobranca
                                            ? `/ ${servico.forma_cobranca}`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </Campo>

                        <Campo
                            id="pet_id"
                            label="Pet"
                            value={formulario.pet_id}
                            onChange={handleChange}
                            required
                        >
                            <select
                                id="pet_id"
                                name="pet_id"
                                value={formulario.pet_id}
                                onChange={handleChange}
                                required
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#1B3347] focus:ring-4 focus:ring-[#1B3347]/10"
                            >
                                <option value="" disabled>
                                    Selecione um pet
                                </option>

                                {pets.map((pet) => (
                                    <option key={pet.id} value={pet.id}>
                                        {pet.nome}
                                        {pet.raca ? ` — ${pet.raca}` : ""}
                                    </option>
                                ))}
                            </select>
                        </Campo>

                        {petSelecionado && (
                            <div className="rounded-xl bg-[#1B3347]/5 p-4 sm:col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Pet selecionado
                                </p>

                                <p className="mt-1 font-bold text-[#1B3347]">
                                    {petSelecionado.nome}
                                </p>

                                <p className="mt-1 text-sm text-gray-600">
                                    {petSelecionado.raca || "Raça não informada"}
                                    {petSelecionado.idade != null
                                        ? ` · ${petSelecionado.idade} anos`
                                        : ""}
                                </p>

                                <Link
                                    to={`/pets/${petSelecionado.id}`}
                                    className="mt-2 inline-block text-sm font-semibold text-[#1B3347] underline"
                                >
                                    Consultar cadastro do pet
                                </Link>
                            </div>
                        )}
                    </Secao>

                    <Secao
                        icone="📅"
                        titulo="Data e horário"
                        descricao="Informe quando o serviço deverá começar e terminar."
                    >
                        <Campo
                            id="data_inicio"
                            label="Data de entrada"
                            type="date"
                            value={formulario.data_inicio}
                            onChange={handleChange}
                            min={obterDataLocal()}
                            required
                        />

                        <Campo
                            id="horario_inicio"
                            label="Horário de entrada"
                            type="time"
                            value={formulario.horario_inicio}
                            onChange={handleChange}
                            required
                        />

                        <Campo
                            id="data_fim"
                            label="Data de saída"
                            type="date"
                            value={formulario.data_fim}
                            onChange={handleChange}
                            min={dataMinimaFim}
                            required
                        />

                        <Campo
                            id="horario_fim"
                            label="Horário de saída"
                            type="time"
                            value={formulario.horario_fim}
                            onChange={handleChange}
                            required
                        />

                        {servicoSelecionado && (
                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:col-span-2">
                                <p className="text-sm font-semibold text-gray-700">
                                    Forma de cobrança
                                </p>

                                <p className="mt-1 text-sm text-gray-600">
                                    {servicoSelecionado.forma_cobranca}
                                    {" · "}
                                    {formatarMoeda(valorUnitario)}
                                    {servicoSelecionado.forma_cobranca === "diaria"
                                        ? " por diária"
                                        : servicoSelecionado.forma_cobranca === "hora"
                                            ? " por hora"
                                            : " por serviço"}
                                </p>

                                <p className="mt-2 text-xs leading-5 text-gray-500">
                                    O período e o valor serão submetidos à
                                    análise da equipe. A estimativa não
                                    representa confirmação da reserva.
                                </p>
                            </div>
                        )}
                    </Secao>

                    {ehHospedagem && (
                        <Secao
                            icone="🏡"
                            titulo="Informações da hospedagem"
                            descricao="Informe se esta será a primeira hospedagem do pet e se a adaptação já foi realizada."
                        >
                            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    name="primeira_hospedagem"
                                    checked={formulario.primeira_hospedagem}
                                    onChange={handleChange}
                                    className="mt-1 h-4 w-4 accent-[#1B3347]"
                                />

                                <span>
                                    <span className="block text-sm font-semibold text-gray-800">
                                        Esta será a primeira hospedagem do pet
                                    </span>

                                    <span className="mt-1 block text-xs leading-5 text-gray-500">
                                        A equipe poderá orientar sobre a
                                        adaptação antes da estadia.
                                    </span>
                                </span>
                            </label>

                            {formulario.primeira_hospedagem && (
                                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 sm:col-span-2">
                                    <input
                                        type="checkbox"
                                        name="adaptacao_realizada"
                                        checked={formulario.adaptacao_realizada}
                                        onChange={handleChange}
                                        className="mt-1 h-4 w-4 accent-[#1B3347]"
                                    />

                                    <span>
                                        <span className="block text-sm font-semibold text-gray-800">
                                            A adaptação já foi realizada
                                        </span>

                                        <span className="mt-1 block text-xs leading-5 text-gray-500">
                                            Marque somente se o período de
                                            adaptação já tiver ocorrido.
                                        </span>
                                    </span>
                                </label>
                            )}

                            {formulario.primeira_hospedagem &&
                                !formulario.adaptacao_realizada && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 sm:col-span-2">
                                        A primeira hospedagem exige combinar
                                        previamente a adaptação com a equipe.
                                        O envio da solicitação não substitui
                                        esse procedimento.
                                    </div>
                                )}
                        </Secao>
                    )}

                    <Secao
                        icone="📝"
                        titulo="Observações"
                        descricao="Compartilhe informações adicionais que possam ajudar a equipe a organizar o atendimento."
                    >
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="observacoes"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Observações do tutor
                            </label>

                            <textarea
                                id="observacoes"
                                name="observacoes"
                                value={formulario.observacoes}
                                onChange={handleChange}
                                rows={4}
                                maxLength={2000}
                                placeholder="Escreva aqui informações importantes para a equipe..."
                                className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1B3347] focus:ring-4 focus:ring-[#1B3347]/10"
                            />

                            <p className="mt-1 text-right text-xs text-gray-400">
                                {formulario.observacoes.length}/2000 caracteres
                            </p>
                        </div>
                    </Secao>

                    {servicoSelecionado && quantidade > 0 && (
                        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
                            <h2 className="text-lg font-bold text-gray-800">
                                Resumo da solicitação
                            </h2>

                            <div className="mt-5 space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Serviço
                                    </span>

                                    <span className="text-right font-medium text-gray-800">
                                        {servicoSelecionado.nome}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Pet
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {petSelecionado?.nome || "Não selecionado"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Quantidade calculada
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {quantidade}{" "}
                                        {servicoSelecionado.forma_cobranca === "diaria"
                                            ? quantidade === 1
                                                ? "diária"
                                                : "diárias"
                                            : servicoSelecionado.forma_cobranca === "hora"
                                                ? quantidade === 1
                                                    ? "hora"
                                                    : "horas"
                                                : quantidade === 1
                                                    ? "serviço"
                                                    : "serviços"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                        Valor do serviço
                                    </span>

                                    <span className="font-medium text-gray-800">
                                        {formatarMoeda(valorServico)}
                                    </span>
                                </div>

                                {valorAdaptacao > 0 && (
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Adaptação estimada
                                        </span>

                                        <span className="font-medium text-gray-800">
                                            {formatarMoeda(valorAdaptacao)}
                                        </span>
                                    </div>
                                )}

                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="font-semibold text-gray-700">
                                            Total estimado
                                        </span>

                                        <span className="text-xl font-bold text-[#1B3347]">
                                            {formatarMoeda(valorTotal)}
                                        </span>
                                    </div>
                                </div>

                                {ehHospedagem &&
                                    configuracoes.sinal_obrigatorio && (
                                        <div className="rounded-xl bg-[#1B3347]/5 p-4">
                                            <div className="flex justify-between gap-4">
                                                <span className="text-sm text-gray-600">
                                                    Sinal estimado (
                                                    {Number(
                                                        configuracoes.percentual_sinal
                                                    ) || 0}
                                                    %)
                                                </span>

                                                <span className="font-bold text-[#1B3347]">
                                                    {formatarMoeda(valorSinal)}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-xs leading-5 text-gray-500">
                                                O sinal será tratado conforme
                                                as regras da empresa após a
                                                análise da solicitação. Nenhum
                                                pagamento está sendo realizado
                                                nesta etapa.
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </section>
                    )}

                    <div className="flex flex-col-reverse gap-3 pb-6 sm:flex-row sm:justify-end">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={
                                salvando ||
                                !servicos.length ||
                                !pets.length
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3347] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#27465F] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {salvando && (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            )}

                            {salvando
                                ? "Enviando solicitação..."
                                : "Solicitar agendamento"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
