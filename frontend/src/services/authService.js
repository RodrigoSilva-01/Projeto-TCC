import { supabase } from "../lib/supabase";

export async function cadastrarUsuario({
    nome,
    email,
    senha,
    telefone,
    slug,
}) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
            data: {
                nome: nome.trim(),
                telefone: telefone.trim(),
            },
        },
    });

    if (error) {
        throw new Error(error.message);
    }

    if (!data.user) {
        throw new Error("Não foi possível criar o usuário.");
    }

    // Só é possível vincular imediatamente se houver sessão.
    if (slug && data.session) {
        await vincularUsuarioEmpresaPorSlug(slug);
    }

    return data;
}


export async function loginUsuario({ email, senha, slug }) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
    });

    if (error) {
        throw new Error(error.message);
    }

    if (slug) {
        await vincularUsuarioEmpresaPorSlug(slug);
    }

    return data;
}

export async function buscarUsuarioAtual() {
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
        throw new Error(authError.message);
    }

    if (!user) {
        throw new Error("Usuário não autenticado.");
    }

    const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        throw new Error(
            "O perfil deste usuário não foi encontrado em usuarios."
        );
    }

    return data;
}

export async function logoutUsuario() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
}

export async function buscarVinculosEmpresa(usuarioId) {
    const { data, error } = await supabase
        .from("empresa_usuarios")
        .select("empresa_id, perfil, ativo")
        .eq("usuario_id", usuarioId)
        .eq("ativo", true);
    
    if(error) {
        throw new Error(`Erro ao buscar vinculo com empresa: ${error.message}`);
    }

    return data ?? [];
}

export async function vincularUsuarioEmpresaPorSlug(slug) {
    if (!slug?.trim()) {
        throw new Error("O identificador da empresa é obrigatório.");
    }

    const slugNormalizado = slug.trim().toLowerCase();

    console.log("Slug recebido:", slugNormalizado);

    const { data, error } = await supabase.rpc(
        "vincular_usuario_empresa_por_slug",
        {
            p_slug: slugNormalizado,
        }
    );

    if (error) {
        console.error("Erro ao vincular usuário à empresa:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
        });

        throw new Error(
            `Não foi possível vincular o usuário à empresa: ${ error.message } `
        );
    }

    console.log("Vínculo retornado pelo Supabase:", data);

    return Array.isArray(data) ? data[0] : data;
}
