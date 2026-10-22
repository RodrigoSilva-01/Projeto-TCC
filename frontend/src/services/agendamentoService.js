import { supabase } from "../lib/supabase";

export async function buscarServicos(empresaId) {
    const { data, error } = await supabase
        .from("servicos")
        .select("id, nome, tipo, descricao, preco, forma_cobranca")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("nome");

    if (error) {
        throw new Error(`Erro ao buscar serviços: ${error.message}`);
    }

    return data ?? [];
}

export async function buscarPets(usuarioId) {
    const { data, error } = await supabase
        .from("pets")
        .select("id, nome, raca, idade, sexo, castrado")
        .eq("usuario_id", usuarioId)
        .order("nome");

    if (error) {
        throw new Error(`Erro ao buscar pets: ${error.message}`);
    }

    return data ?? [];
}

export async function buscarDadosPet(petId) {
    const tabelas = [
        "saude_pet",
        "alimentacao_pet",
        "comportamento_pet",
        "higiene_pet",
        "rotina_pet",
        "emergencia_pet",
    ];

    const resultados = await Promise.all(
        tabelas.map(async (tabela) => {
            const { data, error } = await supabase
                .from(tabela)
                .select("*")
                .eq("pet_id", petId)
                .maybeSingle();

            if (error) {
                throw new Error(
                    `Erro ao buscar dados de ${tabela}: ${error.message}`
                );
            }

            return [tabela, data ?? {}];
        })
    );

    const dadosPet = Object.fromEntries(resultados);

    // Busca os documentos já cadastrados para o pet.
    const { data: documentos, error } = await supabase
        .from("documentos_pet")
        .select("*")
        .eq("pet_id", petId);

    if (error) {
        throw new Error(
            `Erro ao buscar documentos do pet: ${error.message}`
        );
    }

    dadosPet.documentos_pet = documentos ?? [];

    return dadosPet;
}

// ==========================================
// 4. SALVAR OU ATUALIZAR OS DADOS DO PET
// ==========================================
export async function salvarDadosPet(petId, dados) {
    const tabelas = [
        "saude_pet",
        "alimentacao_pet",
        "comportamento_pet",
        "higiene_pet",
        "rotina_pet",
        "emergencia_pet",
    ];

    for (const tabela of tabelas) {
        const dadosTabela = dados[tabela];

        // Não cria registros vazios para etapas não preenchidas.
        if (
            !dadosTabela ||
            Object.keys(dadosTabela).length === 0
        ) {
            continue;
        }

        const { error } = await supabase
            .from(tabela)
            .upsert(
                {
                    ...dadosTabela,
                    pet_id: petId,
                },
                {
                    onConflict: "pet_id",
                }
            );

        if (error) {
            throw new Error(
                `Erro ao salvar ${tabela}: ${error.message}`
            );
        }
    }
}

// ==========================================
// 5. CRIAR SOLICITAÇÃO DE AGENDAMENTO
// ==========================================
export async function criarAgendamento(dados) {
    const { data, error } = await supabase
        .from("agendamentos")
        .insert({
            empresa_id: dados.empresa_id,
            usuario_id: dados.usuario_id,
            pet_id: dados.pet_id,
            servico_id: dados.servico_id,
            data_inicio: dados.data_inicio,
            horario_inicio: dados.horario_inicio,
            data_fim: dados.data_fim,
            horario_fim: dados.horario_fim,
            quantidade: dados.quantidade,
            valor_unitario: dados.valor_unitario,
            valor_total: dados.valor_total,
            valor_sinal: dados.valor_sinal,
            status: "aguardando_avaliacao",
            primeira_hospedagem: dados.primeira_hospedagem,
            adaptacao_realizada: dados.adaptacao_realizada,
            observacoes: dados.observacoes,
        })
        .select()
        .single();

    if (error) {
        throw new Error(
            `Erro ao criar agendamento: ${error.message}`
        );
    }

    return data;
}


/**
 * Busca os agendamentos da empresa para a área administrativa.
 */
export async function buscarAgendamentosEmpresa(empresaId) {
    if (!empresaId) {
        throw new Error("A empresa não foi identificada.");
    }

    const { data: agendamentos, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("data_inicio", { ascending: false });

    if (error) {
        throw new Error(
            `Erro ao buscar agendamentos: ${error.message}`
        );
    }

    if (!agendamentos || agendamentos.length === 0) {
        return [];
    }

    // Obtém os IDs necessários para buscar os dados relacionados.
    const usuarioIds = [
        ...new Set(agendamentos.map((item) => item.usuario_id)),
    ];

    const petIds = [
        ...new Set(agendamentos.map((item) => item.pet_id)),
    ];

    const servicoIds = [
        ...new Set(agendamentos.map((item) => item.servico_id)),
    ];

    // Busca tutores, pets e serviços em paralelo.
    const [usuariosResult, petsResult, servicosResult] =
        await Promise.all([
            supabase
                .from("usuarios")
                .select("id, nome, email, telefone")
                .in("id", usuarioIds),

            supabase
                .from("pets")
                .select("id, nome, raca")
                .in("id", petIds),

            supabase
                .from("servicos")
                .select("id, nome, tipo")
                .in("id", servicoIds),
        ]);

    const resultados = [
        usuariosResult,
        petsResult,
        servicosResult,
    ];

    const erroBusca = resultados.find((resultado) => resultado.error);

    if (erroBusca) {
        throw new Error(
            `Erro ao buscar dados relacionados: ${erroBusca.error.message}`
        );
    }

    // Cria mapas para localizar os dados sem consultas adicionais.
    const usuarios = new Map(
        (usuariosResult.data ?? []).map((item) => [item.id, item])
    );

    const pets = new Map(
        (petsResult.data ?? []).map((item) => [item.id, item])
    );

    const servicos = new Map(
        (servicosResult.data ?? []).map((item) => [item.id, item])
    );

    // Retorna cada agendamento acompanhado dos dados relacionados.
    return agendamentos.map((agendamento) => ({
        ...agendamento,
        tutor: usuarios.get(agendamento.usuario_id) ?? null,
        pet: pets.get(agendamento.pet_id) ?? null,
        servico: servicos.get(agendamento.servico_id) ?? null,
    }));
}

/**
 * Atualiza o status de um agendamento da empresa.
 */
export async function atualizarStatusAgendamento(
    agendamentoId,
    empresaId,
    novoStatus
) {
    if (!agendamentoId || !empresaId || !novoStatus) {
        throw new Error(
            "Informe o agendamento, a empresa e o novo status."
        );
    }

    const statusPermitidos = [
        "aguardando",
        "aguardando_avaliacao",
        "aguardando_sinal",
        "confirmado",
        "em_andamento",
        "concluido",
        "cancelado",
    ];

    if (!statusPermitidos.includes(novoStatus)) {
        throw new Error("O status informado não é válido.");
    }

    const { data, error } = await supabase
        .from("agendamentos")
        .update({ status: novoStatus })
        .eq("id", agendamentoId)
        .eq("empresa_id", empresaId)
        .select()
        .single();

    if (error) {
        throw new Error(
            `Erro ao atualizar agendamento: ${error.message}`
        );
    }

    return data;
}
