import { supabase } from "../lib/supabase";

export async function buscarComportamentoPet(petId) {
    const { data, error } = await supabase
        .from("comportamento_pet")
        .select("*")
        .eq("pet_id", petId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function salvarComportamentoPet({
    petId,
    socializaAnimais,
    socializaPessoas,
    comportamentoComidaAnimais,
    comportamentoComidaPessoas,
    aceitaCarinho,
    aceitaColo,
    comportamentoAgressivo,
    situacoesAgressividade,
    timidoAnsioso,
    gostaBrincadeiras,
    aceitaPetiscos,
    destroiObjetos,
    observacoes,
}) {
    const { data, error } = await supabase
        .from("comportamento_pet")
        .upsert(
            {
                pet_id: petId,
                socializa_animais: socializaAnimais,
                socializa_pessoas: socializaPessoas,
                comportamento_comida_animais:
                    comportamentoComidaAnimais || null,
                comportamento_comida_pessoas:
                    comportamentoComidaPessoas || null,
                aceita_carinho: aceitaCarinho,
                aceita_colo: aceitaColo,
                comportamento_agressivo: comportamentoAgressivo,
                situacoes_agressividade:
                    situacoesAgressividade || null,
                timido_ansioso: timidoAnsioso,
                gosta_brincadeiras: gostaBrincadeiras,
                aceita_petiscos: aceitaPetiscos,
                destroi_objetos: destroiObjetos,
                observacoes: observacoes || null,
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

export async function excluirComportamentoPet(petId) {
    const { error } = await supabase
        .from("comportamento_pet")
        .delete()
        .eq("pet_id", petId);

    if (error) {
        throw new Error(error.message);
    }
}
