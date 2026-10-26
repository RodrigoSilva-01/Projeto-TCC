
import { supabase } from "../lib/supabase";

// =====================================================
// 1. SOLICITAR ADAPTAÇÃO
// O tutor solicita a adaptação para seu próprio pet.
// A nova adaptação sempre começa pendente.
// =====================================================

export async function solicitarAdaptacao({
    empresaId,
    petId,
    observacoes = "",
}) {
    const { data, error } = await supabase
        .from("adaptacoes_pets")
        .insert({
            empresa_id: empresaId,
            pet_id: petId,
            status: "pendente",
            observacoes,
        })
        .select()
        .single();

    if (error) {
        throw new Error(
            `Erro ao solicitar adaptação: ${error.message}`
        );
    }

    return data;
}

// =====================================================
// 2. BUSCAR ADAPTAÇÕES DO PET
// A RLS controla quais registros o usuário pode consultar.
// =====================================================

export async function buscarAdaptacoesPet(petId) {
    if (!petId) {
        throw new Error("O ID do pet é obrigatório.");
    }

    const { data, error } = await supabase
        .from("adaptacoes_pets")
        .select("*")
        .eq("pet_id", petId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(
            `Erro ao buscar adaptações do pet: ${error.message}`
        );
    }

    return data ?? [];
}

// =====================================================
// 3. BUSCAR ADAPTAÇÕES DA EMPRESA
// Usado na área administrativa.
// =====================================================

export async function buscarAdaptacoesEmpresa(empresaId) {
    if (!empresaId) {
        throw new Error("A empresa não foi identificada.");
    }

    const { data: adaptacoes, error } = await supabase
        .from("adaptacoes_pets")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(
            `Erro ao buscar adaptações: ${error.message}`
        );
    }

    if (!adaptacoes?.length) {
        return [];
    }

    const petIds = [
        ...new Set(adaptacoes.map((item) => item.pet_id)),
    ];

    const { data: pets, error: erroPets } = await supabase
        .from("pets")
        .select("id, nome, raca, usuario_id")
        .in("id", petIds);

    if (erroPets) {
        throw new Error(
            `Erro ao buscar pets das adaptações: ${erroPets.message}`
        );
    }

    const usuarioIds = [
        ...new Set((pets ?? []).map((pet) => pet.usuario_id)),
    ];

    let usuarios = [];

    if (usuarioIds.length > 0) {
        const { data, error: erroUsuarios } = await supabase
            .from("usuarios")
            .select("id, nome, email, telefone")
            .in("id", usuarioIds);

        if (erroUsuarios) {
            throw new Error(
                `Erro ao buscar tutores: ${erroUsuarios.message}`
            );
        }

        usuarios = data ?? [];
    }

    const mapaPets = new Map(
        (pets ?? []).map((pet) => [pet.id, pet])
    );

    const mapaUsuarios = new Map(
        usuarios.map((usuario) => [usuario.id, usuario])
    );

    return adaptacoes.map((adaptacao) => {
        const pet = mapaPets.get(adaptacao.pet_id) ?? null;

        return {
            ...adaptacao,
            pet: pet
                ? {
                    ...pet,
                    tutor:
                        mapaUsuarios.get(pet.usuario_id) ?? null,
                }
                : null,
        };
    });
}

// =====================================================
// 4. AGENDAR OU REAGENDAR ADAPTAÇÃO
// Somente a equipe pode realizar esta operação,
// conforme a política RLS.
// =====================================================

export async function agendarAdaptacao({
    adaptacaoId,
    empresaId,
    dataAdaptacao,
    horarioInicio,
    horarioFim,
    observacoes,
}) {
    if (
        !adaptacaoId ||
        !empresaId ||
        !dataAdaptacao ||
        !horarioInicio ||
        !horarioFim
    ) {
        throw new Error(
            "Informe a adaptação, a empresa, a data e os horários."
        );
    }

    if (horarioInicio >= horarioFim) {
        throw new Error(
            "O horário inicial deve ser anterior ao horário final."
        );
    }

    const dados = {
        status: "agendada",
        data_adaptacao: dataAdaptacao,
        horario_inicio: horarioInicio,
        horario_fim: horarioFim,
    };

    if (observacoes !== undefined) {
        dados.observacoes = observacoes.trim() || null;
    }

    const { data, error } = await supabase
        .from("adaptacoes_pets")
        .update(dados)
        .eq("id", adaptacaoId)
        .eq("empresa_id", empresaId)
        .in("status", ["pendente", "agendada"])
        .select()
        .maybeSingle();

    if (error) {
        throw new Error(
            `Erro ao agendar adaptação: ${error.message}`
        );
    }

    if (!data) {
        throw new Error(
            "Adaptação não encontrada ou não pode ser agendada."
        );
    }

    return data;
}

// =====================================================
// 5. REGISTRAR PAGAMENTO PRESENCIAL
// O valor é calculado no banco com base na configuração
// da empresa. Não enviamos o valor pelo React.
// =====================================================

export async function registrarPagamentoAdaptacao({
    adaptacaoId,
    formaPagamentoId = null,
    observacoes = "",
}) {
    if (!adaptacaoId) {
        throw new Error("Informe a adaptação.");
    }

    const { data, error } = await supabase.rpc(
        "registrar_pagamento_adaptacao",
        {
            p_adaptacao_id: adaptacaoId,
            p_forma_pagamento_id: formaPagamentoId,
            p_observacoes: observacoes.trim() || null,
        }
    );

    if (error) {
        throw new Error(
            `Erro ao registrar pagamento da adaptação: ${error.message}`
        );
    }

    // A função SQL retorna o ID do pagamento criado.
    return data;
}

// =====================================================
// 6. CONCLUIR ADAPTAÇÃO
// Exige pagamento confirmado e equipe autorizada.
// A política RLS também valida esses requisitos.
// =====================================================

export async function concluirAdaptacao({
    adaptacaoId,
    empresaId,
}) {
    if (!adaptacaoId || !empresaId) {
        throw new Error(
            "Informe a adaptação e a empresa."
        );
    }

    // Identifica a conta autenticada.
    const { data: sessao, error: erroSessao } =
        await supabase.auth.getUser();

    if (erroSessao || !sessao?.user) {
        throw new Error(
            "É necessário estar autenticado para concluir a adaptação."
        );
    }

    // Localiza o ID do usuário na tabela pública usuarios.
    const { data: usuario, error: erroUsuario } = await supabase
        .from("usuarios")
        .select("id")
        .eq("auth_user_id", sessao.user.id)
        .maybeSingle();

    if (erroUsuario) {
        throw new Error(
            `Erro ao identificar o usuário: ${erroUsuario.message}`
        );
    }

    if (!usuario) {
        throw new Error(
            "O perfil do usuário não foi encontrado."
        );
    }

    const { data, error } = await supabase
        .from("adaptacoes_pets")
        .update({
            status: "concluida",
            realizada_em: new Date().toISOString(),
            registrada_por: usuario.id,
        })
        .eq("id", adaptacaoId)
        .eq("empresa_id", empresaId)
        .eq("status", "agendada")
        .select()
        .maybeSingle();

    if (error) {
        throw new Error(
            `Não foi possível concluir a adaptação: ${error.message}`
        );
    }

    if (!data) {
        throw new Error(
            "Adaptação não encontrada ou não está agendada."
        );
    }

    return data;
}

// =====================================================
// 7. CANCELAR ADAPTAÇÃO
// Operação destinada à equipe.
// =====================================================

export async function cancelarAdaptacao({
    adaptacaoId,
    empresaId,
}) {
    if (!adaptacaoId || !empresaId) {
        throw new Error(
            "Informe a adaptação e a empresa."
        );
    }

    const { data, error } = await supabase
        .from("adaptacoes_pets")
        .update({
            status: "cancelada",
        })
        .eq("id", adaptacaoId)
        .eq("empresa_id", empresaId)
        .in("status", ["pendente", "agendada"])
        .select()
        .maybeSingle();

    if (error) {
        throw new Error(
            `Erro ao cancelar adaptação: ${error.message}`
        );
    }

    if (!data) {
        throw new Error(
            "Adaptação não encontrada ou não pode ser cancelada."
        );
    }

    return data;
}
