
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, PawPrint, HeartPulse, Utensils, CalendarClock, Sparkles, ShieldCheck, ChevronRight, LoaderCircle, Info } from "lucide-react";

import {
    buscarPetPorId,
    excluirPet,
} from "../services/petService";

import { buscarSaudePet } from "../services/saudePetService";
import { buscarAlimentacaoPet } from "../services/alimentacaoPetService";
import { buscarRotinaPet } from "../services/rotinaPetService";
import { buscarHigienePet } from "../services/higienePetService";
import { buscarComportamentoPet } from "../services/comportamentoPetService";
import { buscarEmergenciaPet } from "../services/emergenciaPetService";

const botaoPrimario =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B3347] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#29465D] disabled:cursor-not-allowed disabled:opacity-50";

const botaoSecundario =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

function Campo({ titulo, valor }) {
    return (
        <div className="min-w-0 rounded-xl bg-gray-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {titulo}
            </p>

            <div className="break-words text-sm leading-6 text-gray-800">
                {valor ?? "Não informado"}
            </div>
        </div>
    );
}

function ValorBooleano({
    valor,
    verdadeiro = "Sim",
    falso = "Não",
}) {
    if (valor === null || valor === undefined) {
        return (
            <span className="text-gray-500">
                Não informado
            </span>
        );
    }

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${valor
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
        >
            {valor ? verdadeiro : falso}
        </span>
    );
}

function Secao({
    id,
    titulo,
    descricao,
    Icone,
    carregando,
    dados,
    caminho,
    children,
}) {
    return (
        <section
            id={id}
            className="scroll-mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-[#1B3347]">
                        <Icone size={22} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {titulo}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {descricao}
                        </p>
                    </div>
                </div>

                {!carregando && (
                    <Link
                        to={caminho}
                        className={botaoSecundario}
                    >
                        <Pencil size={16} />
                        {dados ? "Editar informações" : "Cadastrar"}
                    </Link>
                )}
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5">
                {carregando ? (
                    <div className="flex items-center gap-2 py-4 text-sm text-gray-500">
                        <LoaderCircle
                            size={18}
                            className="animate-spin"
                        />
                        Carregando informações...
                    </div>
                ) : dados ? (
                    children
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            <Info size={20} />
                        </div>

                        <p className="mt-3 text-sm text-gray-600">
                            Nenhuma informação cadastrada nesta seção.
                        </p>

                        <Link
                            to={caminho}
                            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#1B3347] hover:underline"
                        >
                            Adicionar informações
                            <ChevronRight size={16} />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

function TextoCampo({ titulo, valor }) {
    return (
        <Campo
            titulo={titulo}
            valor={
                valor ? (
                    <span className="whitespace-pre-line">
                        {valor}
                    </span>
                ) : (
                    "Não informado"
                )
            }
        />
    );
}

export default function PetDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [pet, setPet] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [saude, setSaude] = useState(null);
    const [carregandoSaude, setCarregandoSaude] = useState(true);

    const [alimentacao, setAlimentacao] = useState(null);
    const [carregandoAlimentacao, setCarregandoAlimentacao] =
        useState(true);

    const [rotina, setRotina] = useState(null);
    const [carregandoRotina, setCarregandoRotina] = useState(true);

    const [higiene, setHigiene] = useState(null);
    const [carregandoHigiene, setCarregandoHigiene] = useState(true);

    const [comportamento, setComportamento] = useState(null);
    const [carregandoComportamento, setCarregandoComportamento] =
        useState(true);

    const [emergencia, setEmergencia] = useState(null);
    const [carregandoEmergencia, setCarregandoEmergencia] =
        useState(true);

    const [excluindo, setExcluindo] = useState(false);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

    const dadosSaude = saude ?? {};

    // Carregar dados principais do pet
    useEffect(() => {
        let ativo = true;

        async function carregarPet() {
            setCarregando(true);
            setPet(null);
            setErro("");

            try {
                const dados = await buscarPetPorId(id);

                if (ativo) {
                    setPet(dados);
                }
            } catch (error) {
                if (ativo) {
                    setErro(
                        error.message ||
                        "Não foi possível carregar o pet."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarPet();

        return () => {
            ativo = false;
        };
    }, [id]);

    // Carregar informações de saúde
    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregandoSaude(true);
            setSaude(null);

            try {
                const dados = await buscarSaudePet(id);

                if (ativo) setSaude(dados);
            } catch (error) {
                console.error("Erro ao carregar saúde:", error);
            } finally {
                if (ativo) setCarregandoSaude(false);
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [id]);

    // Carregar alimentação
    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregandoAlimentacao(true);
            setAlimentacao(null);

            try {
                const dados = await buscarAlimentacaoPet(id);

                if (ativo) setAlimentacao(dados);
            } catch (error) {
                console.error("Erro ao carregar alimentação:", error);
            } finally {
                if (ativo) setCarregandoAlimentacao(false);
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [id]);

    // Carregar rotina
    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregandoRotina(true);
            setRotina(null);

            try {
                const dados = await buscarRotinaPet(id);

                if (ativo) setRotina(dados);
            } catch (error) {
                console.error("Erro ao carregar rotina:", error);
            } finally {
                if (ativo) setCarregandoRotina(false);
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [id]);

    // Carregar higiene
    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregandoHigiene(true);
            setHigiene(null);

            try {
                const dados = await buscarHigienePet(id);

                if (ativo) setHigiene(dados);
            } catch (error) {
                console.error("Erro ao carregar higiene:", error);
            } finally {
                if (ativo) setCarregandoHigiene(false);
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [id]);

    // Carregar comportamento
    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregandoComportamento(true);
            setComportamento(null);

            try {
                const dados = await buscarComportamentoPet(id);

                if (ativo) setComportamento(dados);
            } catch (error) {
                console.error("Erro ao carregar comportamento:", error);
            } finally {
                if (ativo) setCarregandoComportamento(false);
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [id]);

    // Carregar contatos de emergência
    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregandoEmergencia(true);
            setEmergencia(null);

            try {
                const dados = await buscarEmergenciaPet(id);

                if (ativo) setEmergencia(dados);
            } catch (error) {
                console.error("Erro ao carregar emergência:", error);
            } finally {
                if (ativo) setCarregandoEmergencia(false);
            }
        }

        carregar();

        return () => {
            ativo = false;
        };
    }, [id]);

    async function handleExcluir() {
        setErro("");
        setExcluindo(true);

        try {
            await excluirPet(id);
            navigate("/pets");
        } catch (error) {
            setErro(
                error.message || "Não foi possível excluir o pet."
            );
            setExcluindo(false);
            setMostrarConfirmacao(false);
        }
    }

    const secoes = [
        { id: "saude", nome: "Saúde", Icone: HeartPulse },
        { id: "alimentacao", nome: "Alimentação", Icone: Utensils },
        { id: "rotina", nome: "Rotina", Icone: CalendarClock },
        { id: "higiene", nome: "Higiene", Icone: Sparkles },
        { id: "comportamento", nome: "Comportamento", Icone: PawPrint },
        { id: "emergencia", nome: "Emergência", Icone: ShieldCheck },
    ];

    if (carregando) {
        return (
            <main className="min-h-full bg-gray-50 p-5 sm:p-8">
                <div className="flex items-center gap-3 text-gray-600">
                    <LoaderCircle
                        size={22}
                        className="animate-spin text-[#1B3347]"
                    />
                    Carregando informações do pet...
                </div>
            </main>
        );
    }

    if (!pet) {
        return (
            <main className="min-h-full bg-gray-50 p-5 sm:p-8">
                <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-[#1B3347]">
                        <PawPrint size={25} />
                    </div>

                    <h1 className="mt-4 text-xl font-bold text-gray-900">
                        Não foi possível abrir este pet
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        {erro || "Pet não encontrado."}
                    </p>

                    <Link
                        to="/pets"
                        className={`${botaoPrimario} mt-6`}
                    >
                        <ArrowLeft size={17} />
                        Voltar para meus pets
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <Link
                    to="/pets"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-[#1B3347]"
                >
                    <ArrowLeft size={17} />
                    Voltar para meus pets
                </Link>

                {erro && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {erro}
                    </div>
                )}

                {/* Cabeçalho e dados principais */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="bg-[#1B3347] p-6 text-white sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                                    <PawPrint size={34} />
                                </div>

                                <div>
                                    <p className="text-sm text-white/70">
                                        Perfil do pet
                                    </p>

                                    <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                                        {pet.nome}
                                    </h1>

                                    <p className="mt-1 text-sm text-white/75">
                                        Dados e cuidados do seu companheiro.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Link
                                    to={`/pets/${pet.id}/editar`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1B3347] transition hover:bg-gray-100"
                                >
                                    <Pencil size={16} />
                                    Editar pet
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setMostrarConfirmacao(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    <Trash2 size={16} />
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                        <Campo
                            titulo="Raça"
                            valor={pet.raca || "Não informado"}
                        />

                        <Campo
                            titulo="Idade"
                            valor={
                                pet.idade != null
                                    ? `${pet.idade} ${Number(pet.idade) === 1
                                        ? "ano"
                                        : "anos"
                                    }`
                                    : "Não informado"
                            }
                        />

                        <Campo
                            titulo="Peso"
                            valor={
                                pet.peso != null
                                    ? `${pet.peso} kg`
                                    : "Não informado"
                            }
                        />

                        <Campo
                            titulo="Porte"
                            valor={pet.porte || "Não informado"}
                        />

                        <Campo
                            titulo="Sexo"
                            valor={pet.sexo || "Não informado"}
                        />

                        <Campo
                            titulo="Castrado"
                            valor={
                                <ValorBooleano valor={pet.castrado} />
                            }
                        />
                    </div>

                    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                        <TextoCampo
                            titulo="Descrição"
                            valor={pet.descricao}
                        />
                    </div>
                </section>

                {/* Navegação rápida */}
                <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="font-bold text-gray-900">
                        Informações e cuidados
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Escolha uma seção para consultar os detalhes.
                    </p>

                    <nav
                        aria-label="Navegação pelas informações do pet"
                        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
                    >
                        {secoes.map(({ id: secaoId, nome, Icone }) => (
                            <a
                                key={secaoId}
                                href={`#${secaoId}`}
                                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700 transition hover:border-[#1B3347] hover:bg-gray-50 hover:text-[#1B3347] focus:outline-none focus:ring-2 focus:ring-[#1B3347]"
                            >
                                <Icone size={17} />
                                <span>{nome}</span>
                            </a>
                        ))}
                    </nav>
                </section>

                {/* Saúde */}
                <Secao
                    id="saude"
                    titulo="Saúde"
                    descricao="Vacinas, tratamentos e medicações."
                    Icone={HeartPulse}
                    carregando={carregandoSaude}
                    dados={saude}
                    caminho={`/pets/${pet.id}/saude`}
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Campo
                            titulo="Vacinas"
                            valor={
                                <ValorBooleano valor={dadosSaude.vacinas_em_dia} />
                            }
                        />

                        <Campo
                            titulo="Vermífugo"
                            valor={
                                <ValorBooleano valor={dadosSaude.vermifugo_em_dia} />
                            }
                        />

                        <Campo
                            titulo="Antipulgas"
                            valor={
                                <ValorBooleano valor={dadosSaude.antipulgas_em_dia} />
                            }
                        />

                        <Campo
                            titulo="Tratamento veterinário"
                            valor={
                                <ValorBooleano
                                    valor={dadosSaude.tratamento_veterinario}
                                />
                            }
                        />

                        <Campo
                            titulo="Possui medicação"
                            valor={
                                <ValorBooleano
                                    valor={dadosSaude.possui_medicacao}
                                />
                            }
                        />

                        {dadosSaude.possui_medicacao && (
                            <div className="sm:col-span-2 lg:col-span-3">
                                <TextoCampo
                                    titulo="Descrição da medicação"
                                    valor={dadosSaude.descricao_medicacao}
                                />
                            </div>
                        )}
                    </div>
                </Secao>

                {/* Alimentação */}
                <Secao
                    id="alimentacao"
                    titulo="Alimentação"
                    descricao="Refeições, alergias e restrições alimentares."
                    Icone={Utensils}
                    carregando={carregandoAlimentacao}
                    dados={alimentacao}
                    caminho={`/pets/${pet.id}/alimentacao`}
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Campo
                            titulo="Refeições por dia"
                            valor={
                                alimentacao?.quantidade_refeicoes ??
                                "Não informado"
                            }
                        />

                        <TextoCampo
                            titulo="Horários das refeições"
                            valor={alimentacao?.horarios_refeicoes ?? "Não informado"}
                        />

                        <TextoCampo
                            titulo="Quantidade por refeição"
                            valor={alimentacao?.quantidade_por_refeicao ?? "Não informado"}
                        />

                        <TextoCampo
                            titulo="Alergias alimentares"
                            valor={alimentacao?.alergias ?? "Não informado"}
                        />

                        <TextoCampo
                            titulo="Restrições alimentares"
                            valor={alimentacao?.restricoes_alimentares ?? "Não informado"}
                        />

                        <TextoCampo
                            titulo="Observações"
                            valor={alimentacao?.observacoes ?? "Não informado"}
                        />
                    </div>
                </Secao>

                {/* Rotina */}
                <Secao
                    id="rotina"
                    titulo="Rotina"
                    descricao="Hábitos e rotina diária do pet."
                    Icone={CalendarClock}
                    carregando={carregandoRotina}
                    dados={rotina}
                    caminho={`/pets/${pet.id}/rotina`}
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <TextoCampo
                            titulo="Rotina diária"
                            valor={rotina?.rotina}
                        />

                        <Campo
                            titulo="Passeios"
                            valor={
                                <ValorBooleano
                                    valor={rotina?.permite_passeio}
                                    verdadeiro="Permitidos"
                                    falso="Não permitidos"
                                />
                            }
                        />

                        <TextoCampo
                            titulo="Ambiente habitual"
                            valor={rotina?.ambiente_habitual}
                        />

                        <Campo
                            titulo="Fica sozinho durante a noite?"
                            valor={
                                <ValorBooleano
                                    valor={rotina?.fica_sozinho_noite}
                                />
                            }
                        />

                        <TextoCampo
                            titulo="Iluminação durante a noite"
                            valor={rotina?.luz_durante_noite}
                        />
                    </div>
                </Secao>

                {/* Higiene */}
                <Secao
                    id="higiene"
                    titulo="Higiene"
                    descricao="Cuidados de higiene e necessidades especiais."
                    Icone={Sparkles}
                    carregando={carregandoHigiene}
                    dados={higiene}
                    caminho={`/pets/${pet.id}/higiene`}
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <TextoCampo
                            titulo="Frequência do banho"
                            valor={higiene?.frequencia_banho}
                        />

                        <TextoCampo
                            titulo="Cuidados especiais"
                            valor={higiene?.cuidados_especiais}
                        />

                        <div className="sm:col-span-2">
                            <TextoCampo
                                titulo="Observações"
                                valor={higiene?.observacoes}
                            />
                        </div>
                    </div>
                </Secao>

                {/* Comportamento */}
                <Secao
                    id="comportamento"
                    titulo="Comportamento"
                    descricao="Socialização, personalidade e hábitos."
                    Icone={PawPrint}
                    carregando={carregandoComportamento}
                    dados={comportamento}
                    caminho={`/pets/${pet.id}/comportamento`}
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Campo
                            titulo="Socializa com outros animais?"
                            valor={
                                <ValorBooleano
                                    valor={comportamento?.socializa_animais}
                                />
                            }
                        />

                        <Campo
                            titulo="Socializa com pessoas?"
                            valor={
                                <ValorBooleano
                                    valor={comportamento?.socializa_pessoas}
                                />
                            }
                        />

                        <Campo
                            titulo="Aceita carinho?"
                            valor={
                                <ValorBooleano
                                    valor={comportamento?.aceita_carinho}
                                />
                            }
                        />

                        <Campo
                            titulo="Aceita colo?"
                            valor={
                                <ValorBooleano
                                    valor={comportamento?.aceita_colo}
                                />
                            }
                        />

                        <Campo
                            titulo="Apresenta comportamento agressivo?"
                            valor={
                                <ValorBooleano
                                    valor={comportamento?.comportamento_agressivo}
                                />
                            }
                        />

                        <Campo
                            titulo="É tímido ou ansioso?"
                            valor={
                                <ValorBooleano
                                    valor={comportamento?.timido_ansioso}
                                />
                            }
                        />

                        <Campo
                            titulo="Gosta de brincadeiras?"
                            valor={
                                <ValorBooleano
                                    valor={comportamento?.gosta_brincadeiras}
                                />
                            }
                        />

                        <Campo
                            titulo="Aceita petiscos?"
                            valor={
                                <ValorBooleano
                                    valor={comportamento?.aceita_petiscos}
                                />
                            }
                        />

                        <Campo
                            titulo="Destrói objetos?"
                            valor={
                                <ValorBooleano
                                    valor={comportamento?.destroi_objetos}
                                />
                            }
                        />

                        <div className="sm:col-span-2 lg:col-span-3">
                            <TextoCampo
                                titulo="Comportamento durante a alimentação com outros animais"
                                valor={comportamento?.comportamento_comida_animais}
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3">
                            <TextoCampo
                                titulo="Comportamento durante a alimentação com pessoas"
                                valor={comportamento?.comportamento_comida_pessoas}
                            />
                        </div>

                        {comportamento?.comportamento_agressivo && (
                            <div className="sm:col-span-2 lg:col-span-3">
                                <TextoCampo
                                    titulo="Situações que provocam agressividade"
                                    valor={comportamento?.situacoes_agressividade}
                                />
                            </div>
                        )}

                        <div className="sm:col-span-2 lg:col-span-3">
                            <TextoCampo
                                titulo="Observações"
                                valor={comportamento?.observacoes}
                            />
                        </div>
                    </div>
                </Secao>

                {/* Emergência */}
                <Secao
                    id="emergencia"
                    titulo="Contatos de emergência"
                    descricao="Contatos para situações que exigem atenção imediata."
                    Icone={ShieldCheck}
                    carregando={carregandoEmergencia}
                    dados={emergencia}
                    caminho={`/pets/${pet.id}/emergencia`}
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Campo
                            titulo="Nome do contato"
                            valor={emergencia?.nome_contato || "Não informado"}
                        />

                        <Campo
                            titulo="Telefone do contato"
                            valor={
                                emergencia?.telefone_contato ? (
                                    <a
                                        href={`tel:${emergencia.telefone_contato}`}
                                        className="inline-flex items-center gap-2 font-semibold text-[#1B3347] hover:underline"
                                    >
                                        <Phone size={15} />
                                        {emergencia.telefone_contato}
                                    </a>
                                ) : (
                                    "Não informado"
                                )
                            }
                        />

                        <TextoCampo
                            titulo="Veterinário"
                            valor={emergencia?.veterinario}
                        />

                        <Campo
                            titulo="Telefone do veterinário"
                            valor={
                                emergencia?.telefone_veterinario ? (
                                    <a
                                        href={`tel:${emergencia.telefone_veterinario}`}
                                        className="inline-flex items-center gap-2 font-semibold text-[#1B3347] hover:underline"
                                    >
                                        <Phone size={15} />
                                        {emergencia.telefone_veterinario}
                                    </a>
                                ) : (
                                    "Não informado"
                                )
                            }
                        />

                        <div className="sm:col-span-2">
                            <Campo
                                titulo="Autorização para primeiros socorros"
                                valor={
                                    <ValorBooleano
                                        valor={emergencia?.autoriza_primeiros_socorros}
                                        verdadeiro="Autorizado"
                                        falso="Não autorizado"
                                    />
                                }
                            />
                        </div>
                    </div>
                </Secao>
            </div>

            {/* Confirmação de exclusão */}
            {mostrarConfirmacao && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !excluindo
                        ) {
                            setMostrarConfirmacao(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-exclusao"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                            <Trash2 size={23} />
                        </div>

                        <h2
                            id="titulo-exclusao"
                            className="mt-4 text-xl font-bold text-gray-900"
                        >
                            Excluir pet
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Tem certeza de que deseja excluir{" "}
                            <strong>{pet.nome}</strong>?
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            Essa ação não poderá ser desfeita.
                        </p>

                        {erro && (
                            <p
                                role="alert"
                                className="mt-3 text-sm text-red-600"
                            >
                                {erro}
                            </p>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setMostrarConfirmacao(false)}
                                disabled={excluindo}
                                className={botaoSecundario}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleExcluir}
                                disabled={excluindo}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {excluindo ? (
                                    <>
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Excluindo...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={17} />
                                        Sim, excluir
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
