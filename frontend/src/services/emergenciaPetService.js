
import { supabase } from "../lib/supabase";

// Buscar informações de emergência do pet
export async function buscarEmergenciaPet(petId) {
    const { data, error } = await supabase
        .from("emergencia_pet")
        .select("*")
        .eq("pet_id", petId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

// Cadastrar ou atualizar informações de emergência
export async function salvarEmergenciaPet(petId, dados) {
    const { data, error } = await supabase
        .from("emergencia_pet")
        .upsert(
            {
                pet_id: petId,
                nome_contato: dados.nome_contato,
                telefone_contato: dados.telefone_contato,
                veterinario: dados.veterinario,
                telefone_veterinario: dados.telefone_veterinario,
                autoriza_primeiros_socorros:
                    dados.autoriza_primeiros_socorros,
            },
            {
                onConflict: "pet_id",
            }
        )
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

// Excluir informações de emergência
export async function excluirEmergenciaPet(petId) {
    const { error } = await supabase
        .from("emergencia_pet")
        .delete()
        .eq("pet_id", petId);

    if (error) {
        throw error;
    }
}
