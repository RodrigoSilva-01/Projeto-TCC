import { supabase } from "../lib/supabase";

export async function buscarHistorico(usuarioId) {
    const { data, error } = await supabase
        .from("agendamentos")
        .select("id, data_inicio, horario_inicio, data_fim, horario_fim, status, servico_id, pet_id")
        .eq("usuario_id", usuarioId)
        .order("data_inicio, horario_inicio, data_fim, horario_fim", { ascending: false });
    
    if (error) {
        throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }


    return data ?? [];
}

export async function buscarDetalhesAgendamento(agendamentoId) {
    const { data, error } = await supabase
        .from("agendamentos")
        .select("id, data_inicio, horario_inicio, data_fim, horario_fim, status, servico_id, pet_id")
        .eq("id", agendamentoId)
        .single();

    if (error) {
        throw new Error(`Erro ao buscar detalhes do agendamento: ${error.message}`);
    }

    return data ?? null;
}
