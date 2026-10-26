
import { useEffect, useState } from "react";
import { Clock, Save, CreditCard } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

import {
    buscarHorariosEmpresa,
    salvarHorariosEmpresa,
} from "../services/horariosEmpresaService";


import {
    buscarConfiguracoesEmpresa,
    salvarHorariosConfiguracao,
    buscarLimitesEmpresa,
    salvarLimitesEmpresa,
} from "../services/configuracoesEmpresaService";


import {
    buscarRegrasCobranca,
    salvarRegrasCobranca,
    buscarRegrasCobrancaServicos,
    salvarRegraCobrancaServico,
} from "../services/regrasCobrancaService";

const diasSemana = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
];

function criarHorariosPadrao() {
    return diasSemana.map((_, dia_semana) => ({
        dia_semana,
        aberto: true,
        hora_inicio:
            dia_semana === 0 || dia_semana === 6
                ? "08:00"
                : "07:00",
        hora_fim: "18:00",
    }));
}

const configuracoesPadrao = {
    horario_atendimento_inicio: "07:00",
    horario_atendimento_fim: "18:00",
    horario_entrada_inicio: "07:00",
    horario_entrada_fim: "09:00",
    horario_saida_creche_inicio: "16:00",
    horario_saida_creche_fim: "18:00",
    horario_saida_hospedagem_inicio: "16:00",
    horario_saida_hospedagem_fim: "19:00",
};

const gruposHorarios = [
    {
        titulo: "Atendimento geral",
        descricao: "Horário geral de funcionamento da empresa.",
        inicio: "horario_atendimento_inicio",
        fim: "horario_atendimento_fim",
    },
    {
        titulo: "Entrada dos pets",
        descricao: "Intervalo permitido para o check-in.",
        inicio: "horario_entrada_inicio",
        fim: "horario_entrada_fim",
    },
    {
        titulo: "Saída da creche",
        descricao: "Intervalo permitido para buscar o pet na creche.",
        inicio: "horario_saida_creche_inicio",
        fim: "horario_saida_creche_fim",
    },
    {
        titulo: "Saída da hospedagem",
        descricao: "Intervalo permitido para buscar o pet hospedado.",
        inicio: "horario_saida_hospedagem_inicio",
        fim: "horario_saida_hospedagem_fim",
    },
];

function formatarNomeServico(regra) {
    const servico = Array.isArray(regra.servicos)
        ? regra.servicos[0]
        : regra.servicos;

    return servico?.nome || "Serviço sem nome";
}

export default function ConfiguracoesEmpresa() {
    const { vinculosEmpresa, ehAdministrador } = useAuth();

    // =====================================================
    // EMPRESA
    // =====================================================

    const vinculoAdmin = vinculosEmpresa.find(
        (vinculo) => vinculo.perfil === "admin" && vinculo.ativo
    );

    const empresaId = vinculoAdmin?.empresa_id;

    // =====================================================
    // FUNCIONAMENTO SEMANAL
    // =====================================================

    const [horarios, setHorarios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarHorarios() {
            if (!empresaId || !ehAdministrador) {
                setCarregando(false);
                return;
            }

            setCarregando(true);
            setErro("");

            try {
                const dados = await buscarHorariosEmpresa(empresaId);

                if (!ativo) return;

                const padroes = criarHorariosPadrao();

                const horariosCarregados = padroes.map((padrao) => {
                    const existente = dados.find(
                        (item) =>
                            Number(item.dia_semana) === padrao.dia_semana
                    );

                    if (!existente) return padrao;

                    return {
                        dia_semana: Number(existente.dia_semana),
                        aberto: existente.aberto,
                        hora_inicio: existente.hora_inicio
                            ? existente.hora_inicio.slice(0, 5)
                            : "",
                        hora_fim: existente.hora_fim
                            ? existente.hora_fim.slice(0, 5)
                            : "",
                    };
                });

                setHorarios(horariosCarregados);
            } catch (error) {
                console.error("Erro ao carregar horários:", error);

                if (ativo) {
                    setErro(
                        "Não foi possível carregar os horários da empresa."
                    );
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        carregarHorarios();

        return () => {
            ativo = false;
        };
    }, [empresaId, ehAdministrador]);

    function atualizarHorario(dia, campo, valor) {
        setHorarios((atuais) =>
            atuais.map((horario) =>
                horario.dia_semana === dia
                    ? { ...horario, [campo]: valor }
                    : horario
            )
        );

        setErro("");
        setSucesso("");
    }

    async function handleSalvar(event) {
        event.preventDefault();

        if (!empresaId || !ehAdministrador) {
            setErro("Você não tem permissão para alterar os horários.");
            return;
        }

        setSalvando(true);
        setErro("");
        setSucesso("");

        try {
            await salvarHorariosEmpresa(empresaId, horarios);
            setSucesso("Horários salvos com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar horários:", error);
            setErro(error.message || "Não foi possível salvar os horários.");
        } finally {
            setSalvando(false);
        }
    }

    // =====================================================
    // HORÁRIOS DE ATENDIMENTO, ENTRADA E SAÍDA
    // =====================================================

    const [configuracoes, setConfiguracoes] = useState(
        configuracoesPadrao
    );

    const [carregandoConfiguracoes, setCarregandoConfiguracoes] =
        useState(true);

    const [salvandoConfiguracoes, setSalvandoConfiguracoes] =
        useState(false);

    const [erroConfiguracoes, setErroConfiguracoes] = useState("");
    const [sucessoConfiguracoes, setSucessoConfiguracoes] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarConfiguracoes() {
            if (!empresaId || !ehAdministrador) {
                setCarregandoConfiguracoes(false);
                return;
            }

            setCarregandoConfiguracoes(true);
            setErroConfiguracoes("");

            try {
                const dados = await buscarConfiguracoesEmpresa(empresaId);

                if (!ativo) return;

                if (dados) {
                    setConfiguracoes((atuais) => {
                        const atualizadas = { ...atuais };

                        Object.keys(atuais).forEach((campo) => {
                            if (dados[campo]) {
                                atualizadas[campo] = dados[campo].slice(0, 5);
                            }
                        });

                        return atualizadas;
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar configurações:", error);

                if (ativo) {
                    setErroConfiguracoes(
                        "Não foi possível carregar os horários de entrada e saída."
                    );
                }
            } finally {
                if (ativo) setCarregandoConfiguracoes(false);
            }
        }

        carregarConfiguracoes();

        return () => {
            ativo = false;
        };
    }, [empresaId, ehAdministrador]);

    function atualizarConfiguracao(campo, valor) {
        setConfiguracoes((atuais) => ({
            ...atuais,
            [campo]: valor,
        }));

        setErroConfiguracoes("");
        setSucessoConfiguracoes("");
    }

    async function handleSalvarConfiguracoes(event) {
        event.preventDefault();

        if (!empresaId || !ehAdministrador) {
            setErroConfiguracoes(
                "Você não tem permissão para alterar as configurações."
            );
            return;
        }

        setSalvandoConfiguracoes(true);
        setErroConfiguracoes("");
        setSucessoConfiguracoes("");

        try {
            const dadosSalvos = await salvarHorariosConfiguracao(
                empresaId,
                configuracoes
            );

            setConfiguracoes((atuais) => {
                const atualizadas = { ...atuais };

                Object.keys(atuais).forEach((campo) => {
                    if (dadosSalvos[campo]) {
                        atualizadas[campo] = dadosSalvos[campo].slice(0, 5);
                    }
                });

                return atualizadas;
            });

            setSucessoConfiguracoes(
                "Horários de entrada e saída salvos com sucesso!"
            );
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);

            setErroConfiguracoes(
                error.message ||
                "Não foi possível salvar as configurações."
            );
        } finally {
            setSalvandoConfiguracoes(false);
        }
    }

    // =====================================================
    // CONFIGURAÇÕES GERAIS DE COBRANÇA
    // =====================================================

    const [regrasCobranca, setRegrasCobranca] = useState({
        valor_adaptacao: "50.00",
        percentual_sinal: "30",
        sinal_obrigatorio: true,
        sinal_reembolsavel: false,
        limite_pets_dia: "20",
    });

    const [carregandoCobranca, setCarregandoCobranca] = useState(true);
    const [salvandoCobranca, setSalvandoCobranca] = useState(false);
    const [erroCobranca, setErroCobranca] = useState("");
    const [sucessoCobranca, setSucessoCobranca] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarRegras() {
            if (!empresaId || !ehAdministrador) {
                setCarregandoCobranca(false);
                return;
            }

            setCarregandoCobranca(true);
            setErroCobranca("");

            try {
                const dados = await buscarRegrasCobranca(empresaId);

                if (!ativo) return;

                if (dados) {
                    setRegrasCobranca({
                        valor_adaptacao: String(dados.valor_adaptacao ?? 50),
                        percentual_sinal: String(dados.percentual_sinal ?? 30),
                        sinal_obrigatorio: dados.sinal_obrigatorio ?? true,
                        sinal_reembolsavel: dados.sinal_reembolsavel ?? false,
                        limite_pets_dia: String(dados.limite_pets_dia ?? 20),
                    });
                }
            } catch (error) {
                console.error("Erro ao carregar regras de cobrança:", error);

                if (ativo) {
                    setErroCobranca(
                        "Não foi possível carregar as regras de cobrança."
                    );
                }
            } finally {
                if (ativo) setCarregandoCobranca(false);
            }
        }

        carregarRegras();

        return () => {
            ativo = false;
        };
    }, [empresaId, ehAdministrador]);

    function atualizarRegraCobranca(campo, valor) {
        setRegrasCobranca((atuais) => ({
            ...atuais,
            [campo]: valor,
        }));

        setErroCobranca("");
        setSucessoCobranca("");
    }

    async function handleSalvarCobranca(event) {
        event.preventDefault();

        if (!empresaId || !ehAdministrador) {
            setErroCobranca(
                "Você não tem permissão para alterar as regras de cobrança."
            );
            return;
        }

        setSalvandoCobranca(true);
        setErroCobranca("");
        setSucessoCobranca("");

        try {
            const dadosSalvos = await salvarRegrasCobranca(
                empresaId,
                regrasCobranca
            );

            setRegrasCobranca({
                valor_adaptacao: String(dadosSalvos.valor_adaptacao),
                percentual_sinal: String(dadosSalvos.percentual_sinal),
                sinal_obrigatorio: dadosSalvos.sinal_obrigatorio,
                sinal_reembolsavel: dadosSalvos.sinal_reembolsavel,
                limite_pets_dia: String(dadosSalvos.limite_pets_dia),
            });

            setSucessoCobranca(
                "Configurações gerais de cobrança salvas com sucesso!"
            );
        } catch (error) {
            console.error("Erro ao salvar regras de cobrança:", error);

            setErroCobranca(
                error.message ||
                "Não foi possível salvar as regras de cobrança."
            );
        } finally {
            setSalvandoCobranca(false);
        }
    }

    // =====================================================
    // REGRAS DE COBRANÇA POR SERVIÇO
    // =====================================================

    const [regrasServicos, setRegrasServicos] = useState([]);
    const [carregandoServicos, setCarregandoServicos] = useState(true);
    const [salvandoServicos, setSalvandoServicos] = useState(false);
    const [erroServicos, setErroServicos] = useState("");
    const [sucessoServicos, setSucessoServicos] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarRegrasServicos() {
            if (!empresaId || !ehAdministrador) {
                setCarregandoServicos(false);
                return;
            }

            setCarregandoServicos(true);
            setErroServicos("");

            try {
                const dados = await buscarRegrasCobrancaServicos(empresaId);

                if (!ativo) return;

                const regrasCarregadas = dados.map((regra) => ({
                    ...regra,
                    exige_sinal: regra.exige_sinal === true,
                    percentual_sinal:
                        regra.percentual_sinal == null
                            ? "30"
                            : String(regra.percentual_sinal),
                    ativo: regra.ativo !== false,
                    observacoes: regra.observacoes ?? "",
                }));

                setRegrasServicos(regrasCarregadas);
            } catch (error) {
                console.error(
                    "Erro ao carregar regras por serviço:",
                    error
                );

                if (ativo) {
                    setErroServicos(
                        error.message ||
                        "Não foi possível carregar as regras por serviço."
                    );
                }
            } finally {
                if (ativo) setCarregandoServicos(false);
            }
        }

        carregarRegrasServicos();

        return () => {
            ativo = false;
        };
    }, [empresaId, ehAdministrador]);

    function atualizarRegraServico(servicoId, campo, valor) {
        setRegrasServicos((atuais) =>
            atuais.map((regra) =>
                regra.servico_id === servicoId
                    ? { ...regra, [campo]: valor }
                    : regra
            )
        );

        setErroServicos("");
        setSucessoServicos("");
    }

    async function handleSalvarRegrasServicos(event) {
        event.preventDefault();

        if (!empresaId || !ehAdministrador) {
            setErroServicos(
                "Você não tem permissão para alterar as regras dos serviços."
            );
            return;
        }

        setSalvandoServicos(true);
        setErroServicos("");
        setSucessoServicos("");

        try {
            // Salva cada regra separadamente.
            for (const regra of regrasServicos) {
                await salvarRegraCobrancaServico(empresaId, {
                    servico_id: regra.servico_id,
                    tipo_cobranca: regra.tipo_cobranca,
                    exige_sinal: regra.exige_sinal,
                    percentual_sinal: regra.percentual_sinal,
                    momento_sinal: regra.momento_sinal,
                    momento_restante: regra.momento_restante,
                    observacoes: regra.observacoes,
                    ativo: regra.ativo,
                });
            }

            // Recarrega as informações persistidas no banco.
            const dadosAtualizados =
                await buscarRegrasCobrancaServicos(empresaId);

            setRegrasServicos(
                dadosAtualizados.map((regra) => ({
                    ...regra,
                    exige_sinal: regra.exige_sinal === true,
                    percentual_sinal:
                        regra.percentual_sinal == null
                            ? "30"
                            : String(regra.percentual_sinal),
                    ativo: regra.ativo !== false,
                    observacoes: regra.observacoes ?? "",
                }))
            );

            setSucessoServicos(
                "Regras de cobrança dos serviços salvas com sucesso!"
            );
        } catch (error) {
            console.error(
                "Erro ao salvar regras dos serviços:",
                error
            );

            setErroServicos(
                error.message ||
                "Não foi possível salvar todas as regras dos serviços."
            );
        } finally {
            setSalvandoServicos(false);
        }
    }


    // =====================================================
    // CAPACIDADE E EXPIRAÇÃO DE AGENDAMENTOS
    // =====================================================

    const [limitesEmpresa, setLimitesEmpresa] = useState({
        limite_hospedagem: "20",
        limite_creche: "20",
        minutos_expiracao_agendamento: "60",
    });

    const [carregandoLimites, setCarregandoLimites] = useState(true);
    const [salvandoLimites, setSalvandoLimites] = useState(false);
    const [erroLimites, setErroLimites] = useState("");
    const [sucessoLimites, setSucessoLimites] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarLimites() {
            if (!empresaId || !ehAdministrador) {
                setCarregandoLimites(false);
                return;
            }

            setCarregandoLimites(true);
            setErroLimites("");

            try {
                const dados = await buscarLimitesEmpresa(empresaId);

                if (!ativo) return;

                if (dados) {
                    setLimitesEmpresa({
                        limite_hospedagem: String(
                            dados.limite_hospedagem ?? 20
                        ),
                        limite_creche: String(
                            dados.limite_creche ?? 20
                        ),
                        minutos_expiracao_agendamento: String(
                            dados.minutos_expiracao_agendamento ?? 60
                        ),
                    });
                }
            } catch (error) {
                console.error(
                    "Erro ao carregar limites da empresa:",
                    error
                );

                if (ativo) {
                    setErroLimites(
                        error.message ||
                        "Não foi possível carregar os limites da empresa."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregandoLimites(false);
                }
            }
        }

        carregarLimites();

        return () => {
            ativo = false;
        };
    }, [empresaId, ehAdministrador]);

    function atualizarLimite(campo, valor) {
        setLimitesEmpresa((atuais) => ({
            ...atuais,
            [campo]: valor,
        }));

        setErroLimites("");
        setSucessoLimites("");
    }

    async function handleSalvarLimites(event) {
        event.preventDefault();

        if (!empresaId || !ehAdministrador) {
            setErroLimites(
                "Você não tem permissão para alterar os limites da empresa."
            );
            return;
        }

        setSalvandoLimites(true);
        setErroLimites("");
        setSucessoLimites("");

        try {
            const dadosSalvos = await salvarLimitesEmpresa(
                empresaId,
                limitesEmpresa
            );

            setLimitesEmpresa({
                limite_hospedagem: String(
                    dadosSalvos.limite_hospedagem
                ),
                limite_creche: String(
                    dadosSalvos.limite_creche
                ),
                minutos_expiracao_agendamento: String(
                    dadosSalvos.minutos_expiracao_agendamento
                ),
            });

            setSucessoLimites(
                "Capacidades e tempo de expiração salvos com sucesso!"
            );
        } catch (error) {
            console.error(
                "Erro ao salvar limites da empresa:",
                error
            );

            setErroLimites(
                error.message ||
                "Não foi possível salvar os limites da empresa."
            );
        } finally {
            setSalvandoLimites(false);
        }
    }


    // =====================================================
    // PERMISSÕES
    // =====================================================

    if (!ehAdministrador) {
        return (
            <div className="p-8 text-gray-600">
                Acesso permitido somente ao administrador.
            </div>
        );
    }

    if (!empresaId) {
        return (
            <div className="p-8 text-gray-600">
                Não foi possível identificar a empresa vinculada ao
                administrador.
            </div>
        );
    }

    if (carregando) {
        return (
            <div className="p-8 text-gray-600">
                Carregando configurações...
            </div>
        );
    }

    // =====================================================
    // INTERFACE
    // =====================================================

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                            <Clock size={26} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-[#1B3347] md:text-3xl">
                                Configurações da empresa
                            </h1>

                            <p className="mt-1 text-sm text-gray-600">
                                Gerencie os horários e as regras de cobrança
                                dos serviços.
                            </p>
                        </div>
                    </div>
                </header>

                {/* FORMULÁRIO 1: FUNCIONAMENTO SEMANAL */}

                <form
                    onSubmit={handleSalvar}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-8"
                >
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-[#1B3347]">
                            Funcionamento semanal
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Defina os dias e horários de atendimento.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {horarios.map((horario) => (
                            <div
                                key={horario.dia_semana}
                                className="grid grid-cols-1 items-center gap-4 rounded-xl border border-gray-100 p-4 md:grid-cols-[1.2fr_0.8fr_1fr_1fr]"
                            >
                                <span className="font-medium text-[#1B3347]">
                                    {diasSemana[horario.dia_semana]}
                                </span>

                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={horario.aberto}
                                        onChange={(event) =>
                                            atualizarHorario(
                                                horario.dia_semana,
                                                "aberto",
                                                event.target.checked
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Aberto
                                </label>

                                <label className="text-sm text-gray-600">
                                    <span className="mb-1 block">
                                        Abertura
                                    </span>

                                    <input
                                        type="time"
                                        value={horario.hora_inicio}
                                        disabled={!horario.aberto}
                                        required={horario.aberto}
                                        onChange={(event) =>
                                            atualizarHorario(
                                                horario.dia_semana,
                                                "hora_inicio",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 p-2 text-gray-800 disabled:bg-gray-100"
                                    />
                                </label>

                                <label className="text-sm text-gray-600">
                                    <span className="mb-1 block">
                                        Fechamento
                                    </span>

                                    <input
                                        type="time"
                                        value={horario.hora_fim}
                                        disabled={!horario.aberto}
                                        required={horario.aberto}
                                        onChange={(event) =>
                                            atualizarHorario(
                                                horario.dia_semana,
                                                "hora_fim",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 p-2 text-gray-800 disabled:bg-gray-100"
                                    />
                                </label>
                            </div>
                        ))}
                    </div>

                    {erro && (
                        <p
                            role="alert"
                            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {erro}
                        </p>
                    )}

                    {sucesso && (
                        <p
                            role="status"
                            className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700"
                        >
                            {sucesso}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={salvando || horarios.length !== 7}
                            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={18} />
                            {salvando ? "Salvando..." : "Salvar horários"}
                        </button>
                    </div>
                </form>

                {/* FORMULÁRIO 2: HORÁRIOS DE ENTRADA E SAÍDA */}

                <form
                    onSubmit={handleSalvarConfiguracoes}
                    className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-8"
                >
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-[#1B3347]">
                            Horários de entrada e saída
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Configure os intervalos permitidos para atendimento,
                            entrada e retirada dos pets.
                        </p>
                    </div>

                    {carregandoConfiguracoes ? (
                        <p className="text-sm text-gray-600">
                            Carregando horários...
                        </p>
                    ) : (
                        <div className="space-y-6">
                            {gruposHorarios.map((grupo) => (
                                <div
                                    key={grupo.inicio}
                                    className="rounded-xl border border-gray-100 p-4"
                                >
                                    <h3 className="font-semibold text-[#1B3347]">
                                        {grupo.titulo}
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {grupo.descricao}
                                    </p>

                                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="text-sm text-gray-600">
                                            <span className="mb-1 block">
                                                Início
                                            </span>

                                            <input
                                                type="time"
                                                required
                                                value={configuracoes[grupo.inicio]}
                                                onChange={(event) =>
                                                    atualizarConfiguracao(
                                                        grupo.inicio,
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 p-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>

                                        <label className="text-sm text-gray-600">
                                            <span className="mb-1 block">
                                                Fim
                                            </span>

                                            <input
                                                type="time"
                                                required
                                                value={configuracoes[grupo.fim]}
                                                onChange={(event) =>
                                                    atualizarConfiguracao(
                                                        grupo.fim,
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 p-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {erroConfiguracoes && (
                        <p
                            role="alert"
                            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {erroConfiguracoes}
                        </p>
                    )}

                    {sucessoConfiguracoes && (
                        <p
                            role="status"
                            className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700"
                        >
                            {sucessoConfiguracoes}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                salvandoConfiguracoes ||
                                carregandoConfiguracoes
                            }
                            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={18} />
                            {salvandoConfiguracoes
                                ? "Salvando..."
                                : "Salvar horários de entrada e saída"}
                        </button>
                    </div>
                </form>

                {/* FORMULÁRIO 3: COBRANÇA GERAL */}

                <form
                    onSubmit={handleSalvarCobranca}
                    className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-8"
                >
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-[#1B3347]">
                            Configurações gerais de cobrança
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Configure a taxa de adaptação e a capacidade diária
                            geral da empresa.
                        </p>
                    </div>

                    {carregandoCobranca ? (
                        <p className="text-sm text-gray-600">
                            Carregando regras de cobrança...
                        </p>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                <label className="text-sm text-gray-600">
                                    <span className="mb-1 block font-medium">
                                        Taxa de adaptação (R$)
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={regrasCobranca.valor_adaptacao}
                                        onChange={(event) =>
                                            atualizarRegraCobranca(
                                                "valor_adaptacao",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </label>

                                <label className="text-sm text-gray-600">
                                    <span className="mb-1 block font-medium">
                                        Percentual geral de referência (%)
                                    </span>

                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        required
                                        value={regrasCobranca.percentual_sinal}
                                        onChange={(event) =>
                                            atualizarRegraCobranca(
                                                "percentual_sinal",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />

                                    <span className="mt-1 block text-xs text-gray-500">
                                        O percentual efetivo de cada serviço
                                        é configurado abaixo.
                                    </span>
                                </label>

                                <label className="text-sm text-gray-600">
                                    <span className="mb-1 block font-medium">
                                        Limite geral de pets por dia
                                    </span>

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        required
                                        value={regrasCobranca.limite_pets_dia}
                                        onChange={(event) =>
                                            atualizarRegraCobranca(
                                                "limite_pets_dia",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                </label>
                            </div>

                            <div className="space-y-4 rounded-xl border border-gray-100 p-4">
                                <label className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={regrasCobranca.sinal_obrigatorio}
                                        onChange={(event) =>
                                            atualizarRegraCobranca(
                                                "sinal_obrigatorio",
                                                event.target.checked
                                            )
                                        }
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    <span>
                                        <span className="block font-medium text-[#1B3347]">
                                            Configuração geral de sinal obrigatório
                                        </span>

                                        <span className="mt-1 block text-sm text-gray-500">
                                            Campo legado mantido para compatibilidade.
                                            As regras específicas dos serviços são
                                            configuradas na seção seguinte.
                                        </span>
                                    </span>
                                </label>

                                <label className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={regrasCobranca.sinal_reembolsavel}
                                        onChange={(event) =>
                                            atualizarRegraCobranca(
                                                "sinal_reembolsavel",
                                                event.target.checked
                                            )
                                        }
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    <span>
                                        <span className="block font-medium text-[#1B3347]">
                                            Permitir reembolso do sinal
                                        </span>

                                        <span className="mt-1 block text-sm text-gray-500">
                                            Configuração geral. As condições de
                                            cancelamento ainda precisam ser aplicadas
                                            ao fluxo de reservas.
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {erroCobranca && (
                        <p
                            role="alert"
                            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {erroCobranca}
                        </p>
                    )}

                    {sucessoCobranca && (
                        <p
                            role="status"
                            className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700"
                        >
                            {sucessoCobranca}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={salvandoCobranca || carregandoCobranca}
                            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={18} />
                            {salvandoCobranca
                                ? "Salvando..."
                                : "Salvar configurações gerais"}
                        </button>
                    </div>
                </form>

                {/* FORMULÁRIO 4: REGRAS POR SERVIÇO */}

                <form
                    onSubmit={handleSalvarRegrasServicos}
                    className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-8"
                >
                    <div className="mb-6 flex items-start gap-3">
                        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                            <CreditCard size={24} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-[#1B3347]">
                                Regras de cobrança por serviço
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Configure separadamente a exigência de sinal
                                para cada serviço cadastrado.
                            </p>
                        </div>
                    </div>

                    {carregandoServicos ? (
                        <p className="text-sm text-gray-600">
                            Carregando regras dos serviços...
                        </p>
                    ) : erroServicos && regrasServicos.length === 0 ? (
                        <p
                            role="alert"
                            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {erroServicos}
                        </p>
                    ) : regrasServicos.length === 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <p className="font-semibold">
                                Nenhuma regra de serviço encontrada.
                            </p>
                            <p className="mt-1">
                                Verifique se os serviços estão cadastrados e se
                                cada serviço possui uma regra na tabela
                                regras_cobranca do Supabase.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {regrasServicos.map((regra) => (
                                <div
                                    key={regra.id || regra.servico_id}
                                    className="rounded-xl border border-gray-200 p-4 md:p-5"
                                >
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-[#1B3347]">
                                                {formatarNomeServico(regra)}
                                            </h3>

                                            <p className="mt-1 text-xs text-gray-500">
                                                Tipo de cobrança:{" "}
                                                {regra.tipo_cobranca}
                                            </p>
                                        </div>

                                        <label className="flex items-center gap-2 text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={regra.ativo}
                                                onChange={(event) =>
                                                    atualizarRegraServico(
                                                        regra.servico_id,
                                                        "ativo",
                                                        event.target.checked
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            Regra ativa
                                        </label>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={regra.exige_sinal}
                                                onChange={(event) =>
                                                    atualizarRegraServico(
                                                        regra.servico_id,
                                                        "exige_sinal",
                                                        event.target.checked
                                                    )
                                                }
                                                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />

                                            <span>
                                                <span className="block font-medium text-[#1B3347]">
                                                    Exigir sinal para este serviço
                                                </span>

                                                <span className="mt-1 block text-sm text-gray-500">
                                                    Quando desativado, o serviço
                                                    não exige pagamento de sinal
                                                    por esta regra.
                                                </span>
                                            </span>
                                        </label>

                                        <label className="block max-w-sm text-sm text-gray-600">
                                            <span className="mb-1 block font-medium">
                                                Percentual do sinal (%)
                                            </span>

                                            <input
                                                type="number"
                                                min="0.01"
                                                max="100"
                                                step="0.01"
                                                required={regra.exige_sinal}
                                                disabled={!regra.exige_sinal}
                                                value={regra.percentual_sinal}
                                                onChange={(event) =>
                                                    atualizarRegraServico(
                                                        regra.servico_id,
                                                        "percentual_sinal",
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                                            />
                                        </label>

                                        <label className="block text-sm text-gray-600">
                                            <span className="mb-1 block font-medium">
                                                Observações da cobrança
                                            </span>

                                            <textarea
                                                rows={2}
                                                value={regra.observacoes}
                                                onChange={(event) =>
                                                    atualizarRegraServico(
                                                        regra.servico_id,
                                                        "observacoes",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Ex.: condições específicas de pagamento..."
                                                className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {erroServicos && regrasServicos.length > 0 && (
                        <p
                            role="alert"
                            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {erroServicos}
                        </p>
                    )}

                    {sucessoServicos && (
                        <p
                            role="status"
                            className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700"
                        >
                            {sucessoServicos}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                salvandoServicos ||
                                carregandoServicos ||
                                regrasServicos.length === 0
                            }
                            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={18} />
                            {salvandoServicos
                                ? "Salvando regras..."
                                : "Salvar regras por serviço"}
                        </button>
                    </div>
                </form>


                {/* FORMULÁRIO 5: CAPACIDADE E EXPIRAÇÃO */}

                <form
                    onSubmit={handleSalvarLimites}
                    className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-8"
                >
                    <div className="mb-6 flex items-start gap-3">
                        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                            <Clock size={24} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-[#1B3347]">
                                Capacidade e expiração de agendamentos
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Defina a capacidade de atendimento e o tempo
                                permitido para solicitações pendentes.
                            </p>
                        </div>
                    </div>

                    {carregandoLimites ? (
                        <p className="text-sm text-gray-600">
                            Carregando limites da empresa...
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                            <label className="text-sm text-gray-600">
                                <span className="mb-1 block font-medium">
                                    Capacidade da hospedagem
                                </span>

                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    required
                                    value={limitesEmpresa.limite_hospedagem}
                                    onChange={(event) =>
                                        atualizarLimite(
                                            "limite_hospedagem",
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />

                                <span className="mt-1 block text-xs text-gray-500">
                                    Número máximo de pets hospedados
                                    simultaneamente.
                                </span>
                            </label>

                            <label className="text-sm text-gray-600">
                                <span className="mb-1 block font-medium">
                                    Capacidade diária da creche
                                </span>

                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    required
                                    value={limitesEmpresa.limite_creche}
                                    onChange={(event) =>
                                        atualizarLimite(
                                            "limite_creche",
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />

                                <span className="mt-1 block text-xs text-gray-500">
                                    Número máximo de pets atendidos
                                    na creche por dia.
                                </span>
                            </label>

                            <label className="text-sm text-gray-600">
                                <span className="mb-1 block font-medium">
                                    Expiração da solicitação (minutos)
                                </span>

                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    required
                                    value={
                                        limitesEmpresa.minutos_expiracao_agendamento
                                    }
                                    onChange={(event) =>
                                        atualizarLimite(
                                            "minutos_expiracao_agendamento",
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2.5 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                />

                                <span className="mt-1 block text-xs text-gray-500">
                                    Tempo configurado para uma solicitação
                                    pendente, antes de poder expirar.
                                </span>
                            </label>
                        </div>
                    )}

                    {erroLimites && (
                        <p
                            role="alert"
                            className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {erroLimites}
                        </p>
                    )}

                    {sucessoLimites && (
                        <p
                            role="status"
                            className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700"
                        >
                            {sucessoLimites}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={
                                salvandoLimites ||
                                carregandoLimites
                            }
                            className="flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save size={18} />

                            {salvandoLimites
                                ? "Salvando..."
                                : "Salvar capacidade e expiração"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
