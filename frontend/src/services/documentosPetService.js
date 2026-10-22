
import { supabase } from "../lib/supabase";

const BUCKET_DOCUMENTOS = "documentos-pets";

// Busca os documentos cadastrados para um pet.
export async function buscarDocumentosPet(petId) {
    const { data, error } = await supabase
        .from("documentos_pet")
        .select("*")
        .eq("pet_id", petId)
        .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// Envia o arquivo para o Storage e registra seus dados na tabela.
export async function enviarDocumentoPet({
    petId,
    tipo,
    arquivo,
}) {
    if (!arquivo) {
        throw new Error("Selecione um arquivo.");
    }

    const tiposPermitidos = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
        throw new Error(
            "Formato inválido. Envie um PDF, JPG, PNG ou WebP."
        );
    }

    const tamanhoMaximo = 10 * 1024 * 1024;

    if (arquivo.size > tamanhoMaximo) {
        throw new Error("O arquivo deve ter no máximo 10 MB.");
    }

    const nomeSeguro = arquivo.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_");

    const caminhoArquivo =
        `${petId}/${crypto.randomUUID()}-${nomeSeguro}`;

    const { error: erroUpload } = await supabase.storage
        .from(BUCKET_DOCUMENTOS)
        .upload(caminhoArquivo, arquivo, {
            contentType: arquivo.type,
            upsert: false,
        });

    if (erroUpload) {
        throw new Error(erroUpload.message);
    }

    const { data, error: erroRegistro } = await supabase
        .from("documentos_pet")
        .insert({
            pet_id: petId,
            tipo,
            nome_arquivo: arquivo.name,
            caminho_arquivo: caminhoArquivo,
        })
        .select()
        .single();

    if (erroRegistro) {
        // Evita manter um arquivo sem registro na tabela.
        const { error: erroRemocao } = await supabase.storage
            .from(BUCKET_DOCUMENTOS)
            .remove([caminhoArquivo]);

        if (erroRemocao) {
            console.error(
                "Não foi possível remover o arquivo após falha no registro:",
                erroRemocao.message
            );
        }

        throw new Error(erroRegistro.message);
    }

    return data;
}

// Gera um link temporário para visualizar o documento.
export async function gerarLinkDocumento(caminhoArquivo) {
    const { data, error } = await supabase.storage
        .from(BUCKET_DOCUMENTOS)
        .createSignedUrl(caminhoArquivo, 60);

    if (error) {
        throw new Error(error.message);
    }

    return data.signedUrl;
}

// Exclui o registro e o arquivo correspondente.
export async function excluirDocumentoPet(documento) {
    const { error: erroArquivo } = await supabase.storage
        .from(BUCKET_DOCUMENTOS)
        .remove([documento.caminho_arquivo]);

    if (erroArquivo) {
        throw new Error(erroArquivo.message);
    }

    const { error: erroRegistro } = await supabase
        .from("documentos_pet")
        .delete()
        .eq("id", documento.id);

    if (erroRegistro) {
        throw new Error(
            "O arquivo foi removido, mas não foi possível excluir o registro: " +
            erroRegistro.message
        );
    }
}
