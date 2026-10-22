
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    buscarSaudePet,
    salvarSaudePet,
} from "../services/saudePetService";

import {
    buscarDocumentosPet,
    enviarDocumentoPet,
    gerarLinkDocumento,
    excluirDocumentoPet,
} from "../services/documentosPetService";

const COR_PRINCIPAL = "#1B3347";
const TAMANHO_MAXIMO = 10 * 1024 * 1024;

const TIPOS_DOCUMENTOS = [
    {
        tipo: "carteira_vacinacao",
        titulo: "Carteira de vacinação",
        descricao: "Comprove as vacinas aplicadas ao seu pet.",
        icone: "💉",
    },
    {
        tipo: "comprovante_vermifugo",
        titulo: "Comprovante de vermifugação",
        descricao: "Anexe o comprovante de vermifugação.",
        icone: "🩺",
    },
    {
        tipo: "comprovante_antipulgas",
        titulo: "Comprovante de antipulgas",
        descricao: "Anexe o comprovante de aplicação.",
        icone: "🐾",
    },
    {
        tipo: "outro",
        titulo: "Outros documentos",
        descricao: "Adicione outros documentos de saúde.",
        icone: "📄",
    },
];

const TIPOS_ARQUIVO_PERMITIDOS = [
    "pdf",
    "jpg",
    "jpeg",
    "png",
    "webp",
];

function criarFormularioInicial() {
    return {
        vacinasEmDia: null,
        comprovanteVacina: "",
        vermifugoEmDia: null,
        comprovanteVermifugo: "",
        antipulgasEmDia: null,
        comprovanteAntipulgas: "",
        tratamentoVeterinario: null,
        possuiMedicacao: null,
        descricaoMedicacao: "",
    };
}

function CampoBooleano({ id, nome, titulo, descricao, valor, onChange }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300">
            <label
                htmlFor={id}
                className="block font-semibold text-gray-800"
            >
                {titulo}
            </label>

            {descricao && (
                <p className="mt-1 text-sm leading-5 text-gray-500">
                    {descricao}
                </p>
            )}

            <select
                id={id}
                name={nome}
                value={valor === null ? "" : String(valor)}
                onChange={onChange}
                className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/15"
            >
                <option value="">Não informado</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
            </select>
        </div>
    );
}

function SecaoDocumentos({
    documentoTipo,
    documentos,
    enviando,
    desabilitado,
    onEnviar,
    onVisualizar,
    onExcluir,
}) {
    const arquivos = documentos.filter(
        (documento) => documento.tipo === documentoTipo.tipo
    );

    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">
                    {documentoTipo.icone}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">
                        {documentoTipo.titulo}
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-gray-500">
                        {documentoTipo.descricao}
                    </p>
                </div>
            </div>

            <label
                className={`mt-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-5 text-center transition ${desabilitado
                        ? "cursor-not-allowed bg-gray-50 opacity-60"
                        : "cursor-pointer hover:border-[#1B3347] hover:bg-gray-50"
                    }`}
            >
                <span className="text-sm font-semibold text-[#1B3347]">
                    {enviando ? "Enviando arquivo..." : "Selecionar arquivo"}
                </span>

                <span className="mt-1 text-xs leading-5 text-gray-500">
                    PDF, JPG, PNG ou WebP
                </span>

                <span className="text-xs text-gray-500">
                    Tamanho máximo: 10 MB
                </span>

                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={desabilitado}
                    onChange={(event) => {
                        const arquivo = event.target.files?.[0];

                        if (arquivo) {
                            onEnviar(documentoTipo.tipo, arquivo);
                        }

                        event.target.value = "";
                    }}
                />
            </label>

            <div className="mt-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-800">
                        Arquivos enviados
                    </h4>

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {arquivos.length}
                    </span>
                </div>

                {arquivos.length === 0 ? (
                    <div className="rounded-lg bg-gray-50 px-4 py-5 text-center">
                        <p className="text-sm text-gray-500">
                            Nenhum documento enviado ainda.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {arquivos.map((documento) => (
                            <div
                                key={documento.id}
                                className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg">
                                        📎
                                    </div>

                                    <div className="min-w-0">
                                        <p className="break-words text-sm font-medium text-gray-800">
                                            {documento.nome_arquivo}
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Enviado em{" "}
                                            {documento.created_at
                                                ? new Date(
                                                    documento.created_at
                                                ).toLocaleDateString("pt-BR")
                                                : "Data não informada"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 flex-wrap gap-3 sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onVisualizar(documento)
                                        }
                                        disabled={desabilitado}
                                        className="rounded-lg px-3 py-2 text-sm font-medium text-[#1B3347] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Visualizar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onExcluir(documento)}
                                        disabled={desabilitado}
                                        className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default function SaudePet() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState(criarFormularioInicial);
    const [documentos, setDocumentos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [tipoEnviando, setTipoEnviando] = useState("");
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarDados() {
            setCarregando(true);
            setErro("");
            setFormulario(criarFormularioInicial());
            setDocumentos([]);

            try {
                const dados = await buscarSaudePet(id);

                if (!ativo) return;

                if (dados) {
                    setFormulario({
                        vacinasEmDia: dados.vacinas_em_dia ?? null,
                        comprovanteVacina:
                            dados.comprovante_vacina ?? "",
                        vermifugoEmDia: dados.vermifugo_em_dia ?? null,
                        comprovanteVermifugo:
                            dados.comprovante_vermifugo ?? "",
                        antipulgasEmDia:
                            dados.antipulgas_em_dia ?? null,
                        comprovanteAntipulgas:
                            dados.comprovante_antipulgas ?? "",
                        tratamentoVeterinario:
                            dados.tratamento_veterinario ?? null,
                        possuiMedicacao: dados.possui_medicacao ?? null,
                        descricaoMedicacao:
                            dados.descricao_medicacao ?? "",
                    });
                }
            } catch (error) {
                console.error(
                    "Erro ao carregar saúde do pet:",
                    error
                );

                if (ativo) {
                    setErro(
                        "Não foi possível carregar as informações de saúde."
                    );
                }
            }

            try {
                const lista = await buscarDocumentosPet(id);

                if (ativo) {
                    setDocumentos(Array.isArray(lista) ? lista : []);
                }
            } catch (error) {
                console.error("Erro ao carregar documentos:", error);

                if (ativo) {
                    setErro((anterior) =>
                        anterior
                            ? `${anterior} Não foi possível carregar os documentos.`
                            : "Não foi possível carregar os documentos."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarDados();

        return () => {
            ativo = false;
        };
    }, [id]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value,
        }));
    }

    function handleBooleanChange(event) {
        const { name, value } = event.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]:
                value === ""
                    ? null
                    : value === "true",
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (salvando || tipoEnviando) return;

        setErro("");
        setMensagem("");
        setSalvando(true);

        try {
            await salvarSaudePet({
                petId: id,

                vacinasEmDia: formulario.vacinasEmDia,
                comprovanteVacina:
                    formulario.comprovanteVacina || null,

                vermifugoEmDia: formulario.vermifugoEmDia,
                comprovanteVermifugo:
                    formulario.comprovanteVermifugo || null,

                antipulgasEmDia: formulario.antipulgasEmDia,
                comprovanteAntipulgas:
                    formulario.comprovanteAntipulgas || null,

                tratamentoVeterinario:
                    formulario.tratamentoVeterinario,

                possuiMedicacao: formulario.possuiMedicacao,

                descricaoMedicacao:
                    formulario.possuiMedicacao === true
                        ? formulario.descricaoMedicacao.trim() || null
                        : null,
            });

            navigate(`/pets/${id}`);
        } catch (error) {
            console.error(
                "Erro ao salvar saúde do pet:",
                error
            );

            setErro(
                "Não foi possível salvar as informações de saúde. Tente novamente."
            );
        } finally {
            setSalvando(false);
        }
    }

    async function handleEnviarDocumento(tipo, arquivo) {
        if (salvando || tipoEnviando) return;

        setErro("");
        setMensagem("");

        const extensao = arquivo.name
            .split(".")
            .pop()
            .toLowerCase();

        if (!TIPOS_ARQUIVO_PERMITIDOS.includes(extensao)) {
            setErro(
                "Formato inválido. Envie um arquivo PDF, JPG, PNG ou WebP."
            );
            return;
        }

        if (arquivo.size > TAMANHO_MAXIMO) {
            setErro("O arquivo ultrapassa o limite de 10 MB.");
            return;
        }

        if (arquivo.size === 0) {
            setErro("O arquivo selecionado está vazio.");
            return;
        }

        setTipoEnviando(tipo);

        try {
            await enviarDocumentoPet({
                petId: id,
                tipo,
                arquivo,
            });

            const lista = await buscarDocumentosPet(id);

            setDocumentos(Array.isArray(lista) ? lista : []);
            setMensagem("Documento enviado com sucesso.");
        } catch (error) {
            console.error("Erro ao enviar documento:", error);

            setErro(
                error.message ||
                "Não foi possível enviar o documento."
            );
        } finally {
            setTipoEnviando("");
        }
    }

    async function handleVisualizarDocumento(documento) {
        setErro("");
        setMensagem("");

        try {
            const url = await gerarLinkDocumento(
                documento.caminho_arquivo
            );

            if (!url) {
                throw new Error("O link do documento não foi gerado.");
            }

            window.open(url, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Erro ao abrir documento:", error);

            setErro(
                "Não foi possível abrir o documento. Tente novamente."
            );
        }
    }

    async function handleExcluirDocumento(documento) {
        if (salvando || tipoEnviando) return;

        const confirmou = window.confirm(
            `Deseja realmente excluir "${documento.nome_arquivo}"?`
        );

        if (!confirmou) return;

        setErro("");
        setMensagem("");

        try {
            await excluirDocumentoPet(documento);

            setDocumentos((anteriores) =>
                anteriores.filter((item) => item.id !== documento.id)
            );

            setMensagem("Documento excluído com sucesso.");
        } catch (error) {
            console.error("Erro ao excluir documento:", error);

            setErro(
                error.message ||
                "Não foi possível excluir o documento."
            );
        }
    }

    if (carregando) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                <div className="text-center">
                    <div
                        className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#1B3347]"
                        role="status"
                        aria-label="Carregando"
                    />

                    <p className="mt-4 text-sm text-gray-600">
                        Carregando informações de saúde...
                    </p>
                </div>
            </main>
        );
    }

    const ocupado = salvando || Boolean(tipoEnviando);

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <Link
                    to={`/pets/${id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#1B3347] transition hover:underline"
                >
                    <span aria-hidden="true">←</span>
                    Voltar para o pet
                </Link>

                <header className="mt-5 rounded-2xl bg-[#1B3347] p-6 text-white shadow-sm sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
                            🩺
                        </div>

                        <div>
                            <p className="text-sm font-medium text-white/70">
                                Cadastro do pet
                            </p>

                            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                                Informações de saúde
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                                Registre as informações de saúde,
                                tratamentos, medicações e documentos
                                importantes para os cuidados do seu pet.
                            </p>
                        </div>
                    </div>
                </header>

                {erro && (
                    <div
                        role="alert"
                        className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                        <span className="text-lg" aria-hidden="true">
                            ⚠️
                        </span>

                        <p>{erro}</p>
                    </div>
                )}

                {mensagem && (
                    <div
                        role="status"
                        className="mt-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                    >
                        <span className="text-lg" aria-hidden="true">
                            ✓
                        </span>

                        <p>{mensagem}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                Prevenção e cuidados
                            </h2>

                            <p className="mt-1 text-sm leading-5 text-gray-500">
                                Informe a situação atual de cada cuidado
                                preventivo.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <CampoBooleano
                                id="vacinasEmDia"
                                nome="vacinasEmDia"
                                titulo="Vacinas"
                                descricao="A vacinação do pet está em dia?"
                                valor={formulario.vacinasEmDia}
                                onChange={handleBooleanChange}
                            />

                            <CampoBooleano
                                id="vermifugoEmDia"
                                nome="vermifugoEmDia"
                                titulo="Vermifugação"
                                descricao="O vermífugo está em dia?"
                                valor={formulario.vermifugoEmDia}
                                onChange={handleBooleanChange}
                            />

                            <CampoBooleano
                                id="antipulgasEmDia"
                                nome="antipulgasEmDia"
                                titulo="Antipulgas"
                                descricao="A prevenção contra pulgas e carrapatos está em dia?"
                                valor={formulario.antipulgasEmDia}
                                onChange={handleBooleanChange}
                            />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                Documentos de saúde
                            </h2>

                            <p className="mt-1 text-sm leading-5 text-gray-500">
                                Anexe os comprovantes para facilitar a
                                conferência das informações.
                            </p>
                        </div>

                        {TIPOS_DOCUMENTOS.map((documentoTipo) => (
                            <SecaoDocumentos
                                key={documentoTipo.tipo}
                                documentoTipo={documentoTipo}
                                documentos={documentos}
                                enviando={tipoEnviando === documentoTipo.tipo}
                                desabilitado={ocupado}
                                onEnviar={handleEnviarDocumento}
                                onVisualizar={handleVisualizarDocumento}
                                onExcluir={handleExcluirDocumento}
                            />
                        ))}
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                Tratamento veterinário
                            </h2>

                            <p className="mt-1 text-sm leading-5 text-gray-500">
                                Informe se o pet está recebendo algum
                                tratamento veterinário.
                            </p>
                        </div>

                        <CampoBooleano
                            id="tratamentoVeterinario"
                            nome="tratamentoVeterinario"
                            titulo="Está em tratamento?"
                            descricao="Considere tratamentos em andamento orientados por um veterinário."
                            valor={formulario.tratamentoVeterinario}
                            onChange={handleBooleanChange}
                        />
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-gray-900">
                                Medicação
                            </h2>

                            <p className="mt-1 text-sm leading-5 text-gray-500">
                                Registre se o pet utiliza medicamentos e
                                forneça as orientações necessárias.
                            </p>
                        </div>

                        <CampoBooleano
                            id="possuiMedicacao"
                            nome="possuiMedicacao"
                            titulo="O pet utiliza medicação?"
                            descricao="Selecione Sim se ele utiliza algum medicamento."
                            valor={formulario.possuiMedicacao}
                            onChange={handleBooleanChange}
                        />

                        {formulario.possuiMedicacao === true && (
                            <div className="mt-5">
                                <label
                                    htmlFor="descricaoMedicacao"
                                    className="mb-2 block text-sm font-semibold text-gray-800"
                                >
                                    Descrição da medicação
                                </label>

                                <textarea
                                    id="descricaoMedicacao"
                                    name="descricaoMedicacao"
                                    value={formulario.descricaoMedicacao}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Informe o nome do medicamento, a dose prescrita, os horários e as orientações importantes."
                                    className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/15"
                                />

                                <p className="mt-2 text-xs leading-5 text-gray-500">
                                    Registre as orientações prescritas pelo
                                    veterinário.
                                </p>
                            </div>
                        )}
                    </section>

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                        <Link
                            to={`/pets/${id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
                            Cancelar
                        </Link>

                        <button
                            type="submit"
                            disabled={ocupado}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3347] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#27465e] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {salvando && (
                                <span
                                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                                    aria-hidden="true"
                                />
                            )}

                            {salvando
                                ? "Salvando informações..."
                                : "Salvar informações"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
