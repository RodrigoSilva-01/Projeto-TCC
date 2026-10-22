
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    buscarHigienePet,
    salvarHigienePet,
} from "../services/higienePetService";

const COR_PRINCIPAL = "#1B3347";

function criarFormularioInicial() {
    return {
        frequenciaBanho: "",
        cuidadosEspeciais: "",
        observacoes: "",
    };
}

function SecaoFormulario({ titulo, descricao, children }) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">
                    {titulo}
                </h2>

                {descricao && (
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                        {descricao}
                    </p>
                )}
            </div>

            {children}
        </section>
    );
}

function CampoTexto({
    label,
    name,
    value,
    onChange,
    placeholder,
}) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={name}
                className="block text-sm font-semibold text-gray-700"
            >
                {label}
            </label>

            <input
                id={name}
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10"
            />
        </div>
    );
}

function CampoAreaTexto({
    label,
    name,
    value,
    onChange,
    placeholder,
    rows = 4,
}) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={name}
                className="block text-sm font-semibold text-gray-700"
            >
                {label}
            </label>

            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                placeholder={placeholder}
                className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10"
            />
        </div>
    );
}

export default function HigienePet() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formulario, setFormulario] = useState(
        criarFormularioInicial
    );

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;

        async function carregarHigiene() {
            setCarregando(true);
            setErro("");

            try {
                const dados = await buscarHigienePet(id);

                if (!ativo) return;

                if (dados) {
                    setFormulario({
                        frequenciaBanho:
                            dados.frequencia_banho ?? "",
                        cuidadosEspeciais:
                            dados.cuidados_especiais ?? "",
                        observacoes:
                            dados.observacoes ?? "",
                    });
                } else {
                    setFormulario(criarFormularioInicial());
                }
            } catch (error) {
                console.error(
                    "Erro ao buscar higiene do pet:",
                    error
                );

                if (ativo) {
                    setErro(
                        "Não foi possível carregar as informações de higiene."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarHigiene();

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

    async function handleSubmit(event) {
        event.preventDefault();

        setSalvando(true);
        setErro("");

        try {
            await salvarHigienePet({
                petId: id,

                frequenciaBanho:
                    formulario.frequenciaBanho.trim() || null,

                cuidadosEspeciais:
                    formulario.cuidadosEspeciais.trim() || null,

                observacoes:
                    formulario.observacoes.trim() || null,
            });

            navigate(`/pets/${id}`);
        } catch (error) {
            console.error(
                "Erro ao salvar higiene:",
                error
            );

            setErro(
                "Não foi possível salvar as informações. Tente novamente."
            );
        } finally {
            setSalvando(false);
        }
    }

    function voltarParaPet() {
        navigate(`/pets/${id}`);
    }

    if (carregando) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#1B3347]" />

                    <p className="text-sm font-medium text-gray-500">
                        Carregando informações de higiene...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/80 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-4xl">
                {/* Cabeçalho */}
                <header className="mb-8">
                    <button
                        type="button"
                        onClick={voltarParaPet}
                        className="mb-5 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-gray-600 transition hover:text-[#1B3347] focus:outline-none focus:ring-2 focus:ring-[#1B3347]/20"
                    >
                        <span aria-hidden="true">←</span>
                        Voltar para os detalhes do pet
                    </button>

                    <div
                        className="rounded-2xl p-6 text-white shadow-sm sm:p-8"
                        style={{
                            backgroundColor: COR_PRINCIPAL,
                        }}
                    >
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                            Informações do pet
                        </p>

                        <h1 className="text-2xl font-bold sm:text-3xl">
                            Higiene e cuidados
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                            Registre os hábitos de higiene, os cuidados
                            especiais e outras orientações importantes
                            para o bem-estar do seu pet.
                        </p>
                    </div>
                </header>

                {/* Mensagem de erro */}
                {erro && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <p className="font-semibold">
                            Não foi possível concluir a operação
                        </p>

                        <p className="mt-1">{erro}</p>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Frequência do banho */}
                    <SecaoFormulario
                        titulo="Banho"
                        descricao="Informe a frequência com que o pet costuma tomar banho."
                    >
                        <CampoTexto
                            label="Frequência do banho"
                            name="frequenciaBanho"
                            value={formulario.frequenciaBanho}
                            onChange={handleChange}
                            placeholder="Ex.: Uma vez por semana"
                        />

                        <p className="mt-2 text-xs leading-5 text-gray-500">
                            Você também pode informar se o banho é
                            realizado em casa ou em um pet shop.
                        </p>
                    </SecaoFormulario>

                    {/* Cuidados especiais */}
                    <SecaoFormulario
                        titulo="Cuidados especiais"
                        descricao="Descreva os cuidados que a equipe deve conhecer para atender melhor o pet."
                    >
                        <CampoAreaTexto
                            label="Quais cuidados especiais são necessários?"
                            name="cuidadosEspeciais"
                            value={formulario.cuidadosEspeciais}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Ex.: Escovar o pelo diariamente, limpar as patas após os passeios, utilizar produtos específicos..."
                        />
                    </SecaoFormulario>

                    {/* Observações */}
                    <SecaoFormulario
                        titulo="Observações adicionais"
                        descricao="Utilize este espaço para registrar outras informações relevantes sobre a higiene do pet."
                    >
                        <CampoAreaTexto
                            label="Outras informações"
                            name="observacoes"
                            value={formulario.observacoes}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Digite outras informações importantes sobre a higiene do pet..."
                        />
                    </SecaoFormulario>

                    {/* Botões */}
                    <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={voltarParaPet}
                            disabled={salvando}
                            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={salvando}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                                backgroundColor: COR_PRINCIPAL,
                            }}
                        >
                            {salvando && (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            )}

                            {salvando
                                ? "Salvando informações..."
                                : "Salvar informações"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}