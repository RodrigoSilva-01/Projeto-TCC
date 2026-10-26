
import { supabase } from "../lib/supabase";

const CAMPOS_HORARIOS = [
    "horario_atendimento_inicio",
    "horario_atendimento_fim",
    "horario_entrada_inicio",
    "horario_entrada_fim",
    "horario_saida_creche_inicio",
    "horario_saida_creche_fim",
    "horario_saida_hospedagem_inicio",
    "horario_saida_hospedagem_fim",
];

const CAMPOS_LIMITES = [
    "limite_hospedagem",
    "limite_creche",
    "minutos_expiracao_agendamento",
];

// Busca todas as configurações da empresa.
export async function buscarConfiguracoesEmpresa(empresaId) {
    if (!empresaId) {
        throw new Error("O ID da empresa é obrigatório.");
    }

    const { data, error } = await supabase
        .from("configuracoes_empresa")
        .select("*")
        .eq("empresa_id", empresaId)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Erro ao buscar configurações: ${error.message}`
        );
    }

    return data;
}

// Salva os horários de atendimento, entrada e saída.
export async function salvarHorariosConfiguracao(
    empresaId,
    horarios
) {
    if (!empresaId) {
        throw new Error("O ID da empresa é obrigatório.");
    }

    for (let i = 0; i < CAMPOS_HORARIOS.length; i += 2) {
        const inicio = horarios[CAMPOS_HORARIOS[i]];
        const fim = horarios[CAMPOS_HORARIOS[i + 1]];

        if (!inicio || !fim || inicio >= fim) {
            throw new Error(
                "Confira os horários: o início deve ser anterior ao fim."
            );
        }
    }

    const configuracoes = {
        empresa_id: empresaId,
    };

    CAMPOS_HORARIOS.forEach((campo) => {
        configuracoes[campo] = horarios[campo];
    });

    const { data, error } = await supabase
        .from("configuracoes_empresa")
        .upsert(configuracoes, {
            onConflict: "empresa_id",
        })
        .select()
        .single();

    if (error) {
        throw new Error(
            `Erro ao salvar configurações: ${error.message}`
        );
    }

    return data;
}

// Busca os limites de capacidade e o tempo de expiração.
export async function buscarLimitesEmpresa(empresaId) {
    if (!empresaId) {
        throw new Error("O ID da empresa é obrigatório.");
    }

    const { data, error } = await supabase
        .from("configuracoes_empresa")
        .select(CAMPOS_LIMITES.join(", "))
        .eq("empresa_id", empresaId)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Erro ao buscar limites da empresa: ${error.message}`
        );
    }

    return data;
}

// Valida e salva os limites de capacidade e a expiração.
export async function salvarLimitesEmpresa(
    empresaId,
    limites
) {
    if (!empresaId) {
        throw new Error("O ID da empresa é obrigatório.");
    }

    if (!limites) {
        throw new Error("Informe os limites da empresa.");
    }

    const dados = {
        empresa_id: empresaId,
        limite_hospedagem: Number(limites.limite_hospedagem),
        limite_creche: Number(limites.limite_creche),
        minutos_expiracao_agendamento: Number(
            limites.minutos_expiracao_agendamento
        ),
    };

    for (const campo of CAMPOS_LIMITES) {
        if (
            !Number.isInteger(dados[campo]) ||
            dados[campo] < 1
        ) {
            throw new Error(
                "Os limites e o tempo de expiração devem ser números inteiros maiores que zero."
            );
        }
    }

    const { data, error } = await supabase
        .from("configuracoes_empresa")
        .upsert(dados, {
            onConflict: "empresa_id",
        })
        .select(CAMPOS_LIMITES.join(", "))
        .single();

    if (error) {
        throw new Error(
            `Erro ao salvar limites da empresa: ${error.message}`
        );
    }

    return data;
}
