
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import {
  buscarPetsUsuario,
  cadastrarPet,
} from "../services/petService";

export default function Pets() {
  const { usuario, carregando } = useAuth();

  const [formulario, setFormulario] = useState({
    nome: "",
    idade: "",
    raca: "",
    peso: "",
    porte: "",
    sexo: "",
    castrado: false,
    descricao: "",
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);

  const [pets, setPets] = useState([]);
  const [carregandoPets, setCarregandoPets] = useState(true);
  const [erroPets, setErroPets] = useState("");

  // Carrega os pets do usuário
  useEffect(() => {
    if (carregando) {
      return;
    }

    if (!usuario) {
      setPets([]);
      setCarregandoPets(false);
      return;
    }

    async function carregarPets() {
      setCarregandoPets(true);
      setErroPets("");

      try {
        const dados = await buscarPetsUsuario(usuario.id);
        setPets(dados);
      } catch (error) {
        setErroPets(error.message);
      } finally {
        setCarregandoPets(false);
      }
    }

    carregarPets();
  }, [usuario, carregando]);

  // Atualiza os campos do formulário
  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // Limpa o formulário
  function limparFormulario() {
    setFormulario({
      nome: "",
      idade: "",
      raca: "",
      peso: "",
      porte: "",
      sexo: "",
      castrado: false,
      descricao: "",
    });
  }

  // Abre o formulário de cadastro
  function abrirFormulario() {
    setErro("");
    setSucesso("");
    setMostrarFormulario(true);
  }

  // Fecha o formulário sem cadastrar
  function cancelarCadastro() {
    limparFormulario();
    setErro("");
    setMostrarFormulario(false);
  }

  // Cadastra um novo pet
  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!usuario) {
      setErro("Usuário não encontrado.");
      return;
    }

    setSalvando(true);

    try {
      const novoPet = await cadastrarPet({
        usuarioId: usuario.id,
        nome: formulario.nome.trim(),
        idade: formulario.idade
          ? Number(formulario.idade)
          : null,
        raca: formulario.raca.trim() || null,
        peso: formulario.peso
          ? Number(formulario.peso)
          : null,
        porte: formulario.porte || null,
        sexo: formulario.sexo || null,
        castrado: formulario.castrado,
        descricao: formulario.descricao.trim() || null,
      });

      setPets((petsAtuais) => [
        novoPet,
        ...petsAtuais,
      ]);

      setSucesso("Pet cadastrado com sucesso!");

      limparFormulario();
      setMostrarFormulario(false);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="p-6">
        <p className="text-gray-500">
          Carregando usuário...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Cabeçalho */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Meus Pets
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Cadastre seus companheiros e gerencie suas informações.
          </p>
        </div>

        {!mostrarFormulario && (
          <button
            type="button"
            onClick={abrirFormulario}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B3347] px-5 py-3 font-medium text-white transition hover:bg-[#29485f] focus:outline-none focus:ring-2 focus:ring-[#1B3347] focus:ring-offset-2"
          >
            <span className="text-xl leading-none">+</span>
            Cadastrar novo pet
          </button>
        )}
      </header>

      {/* Mensagem de sucesso */}
      {sucesso && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {sucesso}
        </div>
      )}

      {/* Mensagem de erro */}
      {erro && !mostrarFormulario && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {erro}
        </div>
      )}

      {/* Formulário de cadastro */}
      {mostrarFormulario && (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Cadastrar novo pet
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Preencha os dados do seu companheiro.
              </p>
            </div>

            <button
              type="button"
              onClick={cancelarCadastro}
              disabled={salvando}
              aria-label="Fechar formulário"
              className="rounded-lg px-3 py-1 text-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Nome */}
              <div>
                <label
                  htmlFor="nome"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Nome *
                </label>

                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formulario.nome}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  placeholder="Nome do pet"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10"
                />
              </div>

              {/* Idade */}
              <div>
                <label
                  htmlFor="idade"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Idade (anos)
                </label>

                <input
                  id="idade"
                  name="idade"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formulario.idade}
                  onChange={handleChange}
                  placeholder="Ex.: 3"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10"
                />
              </div>

              {/* Raça */}
              <div>
                <label
                  htmlFor="raca"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Raça
                </label>

                <input
                  id="raca"
                  name="raca"
                  type="text"
                  value={formulario.raca}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Ex.: Golden Retriever"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10"
                />
              </div>

              {/* Peso */}
              <div>
                <label
                  htmlFor="peso"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Peso (kg)
                </label>

                <input
                  id="peso"
                  name="peso"
                  type="number"
                  min="0"
                  max="1000"
                  step="0.01"
                  value={formulario.peso}
                  onChange={handleChange}
                  placeholder="Ex.: 12.5"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10"
                />
              </div>

              {/* Porte */}
              <div>
                <label
                  htmlFor="porte"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Porte
                </label>

                <select
                  id="porte"
                  name="porte"
                  value={formulario.porte}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10"
                >
                  <option value="">Selecione</option>
                  <option value="Pequeno">Pequeno</option>
                  <option value="Médio">Médio</option>
                  <option value="Grande">Grande</option>
                </select>
              </div>

              {/* Sexo */}
              <div>
                <label
                  htmlFor="sexo"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Sexo
                </label>

                <select
                  id="sexo"
                  name="sexo"
                  value={formulario.sexo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10"
                >
                  <option value="">Selecione</option>
                  <option value="Macho">Macho</option>
                  <option value="Fêmea">Fêmea</option>
                </select>
              </div>
            </div>

            {/* Castrado */}
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50">
              <input
                name="castrado"
                type="checkbox"
                checked={formulario.castrado}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 accent-[#1B3347]"
              />

              <span className="text-sm font-medium text-gray-700">
                O pet é castrado?
              </span>
            </label>

            {/* Descrição */}
            <div>
              <label
                htmlFor="descricao"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Descrição ou observações
              </label>

              <textarea
                id="descricao"
                name="descricao"
                value={formulario.descricao}
                onChange={handleChange}
                rows={3}
                maxLength={1000}
                placeholder="Conte algo importante sobre seu pet..."
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-[#1B3347] focus:ring-2 focus:ring-[#1B3347]/10"
              />
            </div>

            {/* Erro do formulário */}
            {erro && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {erro}
              </p>
            )}

            {/* Botões */}
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelarCadastro}
                disabled={salvando}
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={salvando}
                className="rounded-lg bg-[#1B3347] px-5 py-2.5 font-medium text-white transition hover:bg-[#29485f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando
                  ? "Cadastrando..."
                  : "Cadastrar pet"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Lista de pets */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Seus companheiros
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {pets.length === 1
                ? "1 pet cadastrado"
                : `${pets.length} pets cadastrados`}
            </p>
          </div>
        </div>

        {/* Carregamento */}
        {carregandoPets && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">
              Carregando seus pets...
            </p>
          </div>
        )}

        {/* Erro ao buscar pets */}
        {erroPets && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Não foi possível carregar seus pets: {erroPets}
          </div>
        )}

        {/* Lista vazia */}
        {!carregandoPets &&
          !erroPets &&
          pets.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
                🐾
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                Você ainda não cadastrou nenhum pet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Cadastre seu primeiro companheiro para manter
                as informações dele organizadas.
              </p>

              {!mostrarFormulario && (
                <button
                  type="button"
                  onClick={abrirFormulario}
                  className="mt-5 rounded-lg bg-[#1B3347] px-5 py-2.5 font-medium text-white transition hover:bg-[#29485f]"
                >
                  Cadastrar meu primeiro pet
                </button>
              )}
            </div>
          )}

        {/* Cartões */}
        {!carregandoPets &&
          !erroPets &&
          pets.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pets.map((pet) => (
                <article
                  key={pet.id}
                  className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl">
                      🐾
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-lg font-bold text-gray-900">
                        {pet.nome}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {pet.raca || "Raça não informada"}
                      </p>
                    </div>
                  </div>

                  <div className="my-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Idade
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {pet.idade != null
                          ? `${pet.idade} anos`
                          : "Não informada"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Peso
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {pet.peso != null
                          ? `${pet.peso} kg`
                          : "Não informado"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Porte
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {pet.porte || "Não informado"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">
                        Sexo
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {pet.sexo || "Não informado"}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <span
                      className={`h-2 w-2 rounded-full ${pet.castrado
                          ? "bg-green-500"
                          : "bg-gray-400"
                        }`}
                    />

                    {pet.castrado
                      ? "Castrado"
                      : "Não castrado"}
                  </div>

                  <div className="mt-auto border-t border-gray-100 pt-4">
                    <Link
                      to={`/pets/${pet.id}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#1B3347] px-4 py-2.5 text-sm font-medium text-[#1B3347] transition hover:bg-[#1B3347] hover:text-white"
                    >
                      Ver detalhes
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}
