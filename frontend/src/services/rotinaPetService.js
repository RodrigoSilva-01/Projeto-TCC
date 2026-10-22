import { supabase } from "../lib/supabase";

export async function buscarRotinaPet(petId) {

    const { data, error } = await supabase
        .from("rotina_pet")
        .select("*")
        .eq("pet_id", petId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function salvarRotinaPet({
    petId,
    rotina,
    permitePasseio,
    ambienteHabitual,
    ficaSozinhoNoite,
    luzDuranteNoite,
}) {

    const { data, error } = await supabase
        .from("rotina_pet")
        .upsert(
            {
                pet_id: petId,

                rotina:
                    rotina || null,

                permite_passeio:
                    permitePasseio,

                ambiente_habitual:
                    ambienteHabitual || null,

                fica_sozinho_noite:
                    ficaSozinhoNoite,

                luz_durante_noite:
                    luzDuranteNoite || null,
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

export async function excluirRotinaPet(petId) {

    const { error } = await supabase
        .from("rotina_pet")
        .delete()
        .eq("pet_id", petId);

    if (error) {
        throw new Error(error.message);
    }
}
