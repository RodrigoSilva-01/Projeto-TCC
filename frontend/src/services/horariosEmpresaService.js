
import { supabase } from "../lib/supabase";

// Busca os horários semanais de uma empresa.
export async function buscarHorariosEmpresa(empresaId) {
    if (!empresaId) {
        throw new Error("O ID da empresa é obrigatório.");
    }

    const { data, error } = await supabase
        .from("horarios_empresa")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("dia_semana");

    if (error) {
        throw error;
    }

    return data;
}

// Salva os horários semanais de uma empresa.
export async function salvarHorariosEmpresa(
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

    // Primeiro, tenta atualizar a configuração existente.
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
            .update(configuracoes)
            .eq("empresa_id", empresaId)
        : supabase
            .from("configuracoes_empresa")
            .insert(configuracoes);

    const { data, error } = await consulta
        .select()
        .single();

    if (error) {
        throw new Error(
            `Erro ao salvar horários: ${error.message}`
        );
    }

    return data;
}
