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