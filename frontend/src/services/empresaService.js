import { supabase } from '../lib/supabase'

export async function buscarEmpresaProSlug(slug) {
    const slugNormalizado = slug?.trim().toLowerCase()

    if(!slugNormalizado) {
        throw new Error('O identificador da empresa não foi informado.');
    }

    const {data, error} = await supabase
        .from("empresas")
        .select("id, nome, nome_fantasia, logo_url, slug")
        .eq("slug", slugNormalizado)
        .eq("ativo", true)
        .maybeSingle();

    if (error) {
        throw new Error(`Erro ao buscar empresa: ${error.message}`);
    }

    if (!data) {
        throw new Error("Empresa não encontrada ou inativa.");
    }

    return data;
}

export async function vincularUsuarioPorSlug(slug) {
    const slugNormalizado = slug?.trim().toLowerCase();

    if (!slugNormalizado) {
        throw new Error("O identificador da empresa não foi informado.");
    }

    const { data, error } = await supabase.rpc(
        "vincular_usuario_empresa_por_slug",
        {
            p_slug: slugNormalizado,
        }
    );

    if (error) {
        throw new Error(`Erro ao vincular usuário à empresa: ${error.message}`);
    }

    if (!data || data.length === 0) {
        throw new Error("Não foi possível confirmar o vínculo com a empresa.");
    }

    return data[0];
}