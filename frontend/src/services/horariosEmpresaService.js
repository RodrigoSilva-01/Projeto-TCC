
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
        throw new Error(
            `Erro ao buscar horários semanais: ${error.message}`
        );
    }

    return data ?? [];
}

// Salva os horários semanais de uma empresa.
export async function salvarHorariosEmpresa(
    empresaId,
    horarios
) {
    if (!empresaId) {
        throw new Error("O ID da empresa é obrigatório.");
    }

    if (!Array.isArray(horarios) || horarios.length !== 7) {
        throw new Error(
            "É necessário informar os horários dos sete dias da semana."
        );
    }

    const dias = new Set();

    const dados = horarios.map((horario) => {
        const dia = Number(horario.dia_semana);

        if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
            throw new Error("Foi informado um dia da semana inválido.");
        }

        if (dias.has(dia)) {
            throw new Error("Existe um dia da semana duplicado.");
        }

        dias.add(dia);

        const aberto = Boolean(horario.aberto);
        const inicio = horario.hora_inicio;
        const fim = horario.hora_fim;

        if (aberto) {
            if (!inicio || !fim || inicio >= fim) {
                throw new Error(
                    "Nos dias abertos, o início deve ser anterior ao fim."
                );
            }
        }

        return {
            empresa_id: empresaId,
            dia_semana: dia,
            aberto,
            hora_inicio: aberto ? inicio : null,
            hora_fim: aberto ? fim : null,
        };
    });

    if (dias.size !== 7) {
        throw new Error(
            "Todos os dias da semana precisam estar configurados."
        );
    }

    const { data, error } = await supabase
        .from("horarios_empresa")
        .upsert(dados, {
            onConflict: "empresa_id,dia_semana",
        })
        .select()
        .order("dia_semana");

    if (error) {
        throw new Error(
            `Erro ao salvar horários semanais: ${error.message}`
        );
    }

    return data;
}
