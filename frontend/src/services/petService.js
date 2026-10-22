import { supabase } from "../lib/supabase";

export async function cadastrarPet({
    usuarioId,
    nome,
    idade,
    raca,
    peso,
    porte,
    sexo,
    castrado,
    descricao,
}) {
    const { data, error } = await supabase
        .from("pets")
        .insert({
            usuario_id: usuarioId,
            nome,
            idade,
            raca,
            peso,
            porte,
            sexo,
            castrado,
            descricao,
        })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function buscarPetsUsuario(usuarioId) {
    const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("usuario_id", usuarioId)
        .order("created_at", {
            ascending: false,
        });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function buscarPetPorId(petId) {

    const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("id", petId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function atualizarPet({
    petId,
    nome,
    idade,
    raca,
    peso,
    porte,
    sexo,
    castrado,
    descricao,
}) {
    const { data, error } = await supabase
        .from("pets")
        .update({
            nome,
            idade,
            raca,
            peso,
            porte,
            sexo,
            castrado,
            descricao,
        })
        .eq("id", petId)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function excluirPet(petId) {

    const { error } = await supabase
        .from("pets")
        .delete()
        .eq("id", petId);

    if (error) {
        throw new Error(error.message);
    }
}