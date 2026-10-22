import { supabase } from "../lib/supabase";

export async function buscarAlimentacaoPet(petId) {

    const { data, error } = await supabase
        .from("alimentacao_pet")
        .select("*")
        .eq("pet_id", petId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function salvarAlimentacaoPet({
    petId,
    quantidadeRefeicoes,
    horariosRefeicoes,
    quantidadePorRefeicao,
    alergias,
    restricoesAlimentares,
    observacoes,
}) {

    const { data, error } = await supabase
        .from("alimentacao_pet")
        .upsert(
            {
                pet_id: petId,

                quantidade_refeicoes:
                    quantidadeRefeicoes,

                horarios_refeicoes:
                    horariosRefeicoes,

                quantidade_por_refeicao:
                    quantidadePorRefeicao,

                alergias:
                    alergias,

                restricoes_alimentares:
                    restricoesAlimentares,

                observacoes:
                    observacoes,
            },
            {
                onConflict: "pet_id",
            }
        )
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function excluirAlimentacaoPet(petId) {

    const { error } = await supabase
        .from("alimentacao_pet")
        .delete()
        .eq("pet_id", petId);

    if (error) {
        throw new Error(error.message);
    }
}
