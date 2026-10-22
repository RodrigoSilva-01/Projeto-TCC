import { supabase } from "../lib/supabase";

export async function buscarSaudePet(petId) {

    const { data, error } = await supabase
        .from("saude_pet")
        .select("*")
        .eq("pet_id", petId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function salvarSaudePet({
    petId,
    vacinasEmDia,
    comprovanteVacina,
    vermifugoEmDia,
    comprovanteVermifugo,
    antipulgasEmDia,
    comprovanteAntipulgas,
    tratamentoVeterinario,
    possuiMedicacao,
    descricaoMedicacao,
}) {

    const { data, error } = await supabase
        .from("saude_pet")
        .upsert(
            {
                pet_id: petId,
                vacinas_em_dia: vacinasEmDia,
                comprovante_vacina: comprovanteVacina,
                vermifugo_em_dia: vermifugoEmDia,
                comprovante_vermifugo: comprovanteVermifugo,
                antipulgas_em_dia: antipulgasEmDia,
                comprovante_antipulgas: comprovanteAntipulgas,
                tratamento_veterinario: tratamentoVeterinario,
                possui_medicacao: possuiMedicacao,
                descricao_medicacao: descricaoMedicacao,
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