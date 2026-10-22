import { supabase } from "../lib/supabase";

export async function buscarHigienePet(petId) {

    const { data, error } = await supabase
        .from("higiene_pet")
        .select("*")
        .eq("pet_id", petId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function salvarHigienePet({
    petId,
    frequenciaBanho,
    cuidadosEspeciais,
    observacoes,
}) {

    const { data, error } = await supabase
        .from("higiene_pet")
        .upsert(
            {
                pet_id: petId,

                frequencia_banho:
                    frequenciaBanho || null,

                cuidados_especiais:
                    cuidadosEspeciais || null,

                observacoes:
                    observacoes || null,
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

export async function excluirHigienePet(petId) {

    const { error } = await supabase
        .from("higiene_pet")
        .delete()
        .eq("pet_id", petId);

    if (error) {
        throw new Error(error.message);
    }
}