
import { supabase } from "../lib/supabase";

// =====================================================
// CONFIGURAÇÕES GERAIS DE COBRANÇA
// Tabela: configuracoes_empresa
// =====================================================

// Busca as configurações gerais de cobrança da empresa.
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

// Salva as configurações gerais sem alterar os horários.
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

    if (!Number.isInteger(limitePets) || limitePets < 1) {
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

// Busca as regras de cobrança cadastradas para cada serviço.
export async function buscarRegrasCobrancaServicos(empresaId) {
    if (!empresaId) {
        throw new Error("O ID da empresa é obrigatório.");
    }

    const { data, error } = await supabase
        .from("regras_cobranca")
        .select(`
            id,
            empresa_id,
            servico_id,
            tipo_cobranca,
            percentual_sinal,
            momento_sinal,
            momento_restante,
            observacoes,
            ativo,
            exige_sinal,
            servicos (
                id,
                nome,
                tipo,
                forma_cobranca,
                preco
            )
        `)
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: true });

    if (error) {
        throw new Error(
            `Erro ao buscar regras por serviço: ${error.message}`
        );
    }

    return data ?? [];
}

// Salva ou atualiza a regra de cobrança de um serviço.
export async function salvarRegraCobrancaServico(empresaId, regra) {
    if (!empresaId) {
        throw new Error("O ID da empresa é obrigatório.");
    }

    if (!regra?.servico_id) {
        throw new Error("Selecione um serviço para configurar.");
    }

    if (!regra?.tipo_cobranca) {
        throw new Error("O tipo de cobrança é obrigatório.");
    }

    const exigeSinal = regra.exige_sinal === true;

    let percentualSinal = null;

    if (exigeSinal) {
        percentualSinal = Number(regra.percentual_sinal);

        if (
            !Number.isFinite(percentualSinal) ||
            percentualSinal <= 0 ||
            percentualSinal > 100
        ) {
            throw new Error(
                "O percentual do sinal deve ser maior que 0 e no máximo 100."
            );
        }
    }

    // Confirma que o serviço pertence à empresa.
    const { data: servico, error: erroServico } = await supabase
        .from("servicos")
        .select("id")
        .eq("id", regra.servico_id)
        .eq("empresa_id", empresaId)
        .maybeSingle();

    if (erroServico) {
        throw new Error(
            `Erro ao verificar serviço: ${erroServico.message}`
        );
    }

    if (!servico) {
        throw new Error(
            "O serviço não foi encontrado para esta empresa."
        );
    }

    const dados = {
        empresa_id: empresaId,
        servico_id: regra.servico_id,
        tipo_cobranca: regra.tipo_cobranca,
        exige_sinal: exigeSinal,
        percentual_sinal: percentualSinal,
        momento_sinal: exigeSinal
            ? (regra.momento_sinal || null)
            : null,
        momento_restante: regra.momento_restante || null,
        observacoes: regra.observacoes?.trim() || null,
        ativo: regra.ativo !== false,
    };

    // Verifica se já existe uma regra para esse serviço.
    const { data: existente, error: erroBusca } = await supabase
        .from("regras_cobranca")
        .select("id")
        .eq("empresa_id", empresaId)
        .eq("servico_id", regra.servico_id)
        .maybeSingle();

    if (erroBusca) {
        throw new Error(
            `Erro ao verificar regra do serviço: ${erroBusca.message}`
        );
    }

    const consulta = existente
        ? supabase
            .from("regras_cobranca")
            .update(dados)
            .eq("id", existente.id)
            .eq("empresa_id", empresaId)
        : supabase
            .from("regras_cobranca")
            .insert(dados);

    const { data: salvo, error } = await consulta
        .select()
        .single();

    if (error) {
        throw new Error(
            `Erro ao salvar regra do serviço: ${error.message}`
        );
    }

    return salvo;
}
