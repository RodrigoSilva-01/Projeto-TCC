
import { supabase } from "../lib/supabase";

export async function buscarRegrasCobranca(empresaId) {
    if (!empresaId) {
        throw new Error("O ID da empresa é obrigatório.");
    }

    const { data, error } = await supabase
        .from("configuracoes_empresa")
        .select(
            "valor_adaptacao, percentual_sinal, sinal_obrigatorio, sinal_reembolsavel, limite_pets_dia"
        )
        .eq("empresa_id", empresaId)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Erro ao buscar regras de cobrança: ${error.message}`
        );
    }

    return data;
}

export async function salvarRegrasCobranca(empresaId, regras) {
    if (!empresaId) {
        throw new Error("O ID da empresa é obrigatório.");
    }

    const valorAdaptacao = Number(regras.valor_adaptacao);
    const percentualSinal = Number(regras.percentual_sinal);
    const limitePets = Number(regras.limite_pets_dia);

    if (!Number.isFinite(valorAdaptacao) || valorAdaptacao < 0) {
        throw new Error(
            "O valor da adaptação não pode ser negativo."
        );
    }

    if (
        !Number.isFinite(percentualSinal) ||
        percentualSinal < 0 ||
        percentualSinal > 100
    ) {
        throw new Error(
            "O percentual do sinal deve estar entre 0 e 100."
        );
    }

    if (
        !Number.isInteger(limitePets) ||
        limitePets < 1
    ) {
        throw new Error(
            "O limite diário deve ser um número inteiro maior que zero."
        );
    }

    const dados = {
        empresa_id: empresaId,
        valor_adaptacao: valorAdaptacao,
        percentual_sinal: percentualSinal,
        sinal_obrigatorio: Boolean(regras.sinal_obrigatorio),
        sinal_reembolsavel: Boolean(regras.sinal_reembolsavel),
        limite_pets_dia: limitePets,
    };

    // Atualiza somente os campos de cobrança quando já existe
    // uma configuração, preservando os horários salvos.
    const { data: existente, error: erroBusca } = await supabase
        .from("configuracoes_empresa")
        .select("id")
        .eq("empresa_id", empresaId)
        .maybeSingle();

    if (erroBusca) {
        throw new Error(
            `Erro ao verificar configurações: ${erroBusca.message}`
        );
    }

    const consulta = existente
        ? supabase
            .from("configuracoes_empresa")
            .update(dados)
            .eq("empresa_id", empresaId)
        : supabase
            .from("configuracoes_empresa")
            .insert(dados);

    const { data: salvo, error } = await consulta
        .select(
            "valor_adaptacao, percentual_sinal, sinal_obrigatorio, sinal_reembolsavel, limite_pets_dia"
        )
        .single();

    if (error) {
        throw new Error(
            `Erro ao salvar regras de cobrança: ${error.message}`
        );
    }

    return salvo;
}
