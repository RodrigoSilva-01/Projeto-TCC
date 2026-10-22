import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    atualizarPet,
    buscarPetPorId,
} from "../services/petService";

export default function PetEditar() {

    const { id } = useParams();
    const navigate = useNavigate();

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

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {

        async function carregarPet() {

            try {

                const pet = await buscarPetPorId(id);

                setFormulario({
                    nome: pet.nome || "",
                    idade: pet.idade ?? "",
                    raca: pet.raca || "",
                    peso: pet.peso ?? "",
                    porte: pet.porte || "",
                    sexo: pet.sexo || "",
                    castrado: pet.castrado ?? false,
                    descricao: pet.descricao || "",
                });

            } catch (error) {

                setErro(error.message);

            } finally {

                setCarregando(false);

            }
        }

        carregarPet();

    }, [id]);

    function handleChange(event) {

        const { name, value, type, checked } = event.target;

        setFormulario((formularioAtual) => ({
            ...formularioAtual,
            [name]: type === "checkbox"
                ? checked
                : value,
        }));
    }

    async function handleSubmit(event) {

        event.preventDefault();

        setErro("");
        setSalvando(true);

        try {

            await atualizarPet({
                petId: id,
                nome: formulario.nome,
                idade: formulario.idade
                    ? Number(formulario.idade)
                    : null,
                raca: formulario.raca || null,
                peso: formulario.peso
                    ? Number(formulario.peso)
                    : null,
                porte: formulario.porte || null,
                sexo: formulario.sexo || null,
                castrado: formulario.castrado,
                descricao: formulario.descricao || null,
            });

            navigate(`/pets/${id}`);

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
                    Carregando informações do pet...
                </p>
            </main>
        );
    }

    return (
        <main className="p-6">

            <div className="mb-6">
                <Link
                    to={`/pets/${id}`}
                    className="text-sm text-blue-600 hover:underline"
                >
                    ← Voltar para detalhes
                </Link>
            </div>

            <h1 className="mb-6 text-2xl font-bold">
                Editar Pet
            </h1>

            {erro && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
                    {erro}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >

                <div>
                    <label
                        htmlFor="nome"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Nome
                    </label>

                    <input
                        id="nome"
                        name="nome"
                        type="text"
                        value={formulario.nome}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="raca"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Raça
                    </label>

                    <input
                        id="raca"
                        name="raca"
                        type="text"
                        value={formulario.raca}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                    />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                        <label
                            htmlFor="idade"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Idade
                        </label>

                        <input
                            id="idade"
                            name="idade"
                            type="number"
                            min="0"
                            value={formulario.idade}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="peso"
                            className="mb-1 block text-sm font-medium text-gray-700"
                        >
                            Peso (kg)
                        </label>

                        <input
                            id="peso"
                            name="peso"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formulario.peso}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                        />
                    </div>

                </div>

                <div>
                    <label
                        htmlFor="porte"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Porte
                    </label>

                    <select
                        id="porte"
                        name="porte"
                        value={formulario.porte}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                    >
                        <option value="">
                            Selecione o porte
                        </option>

                        <option value="Pequeno">
                            Pequeno
                        </option>

                        <option value="Médio">
                            Médio
                        </option>

                        <option value="Grande">
                            Grande
                        </option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="sexo"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Sexo
                    </label>

                    <select
                        id="sexo"
                        name="sexo"
                        value={formulario.sexo}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                    >
                        <option value="">
                            Selecione o sexo
                        </option>

                        <option value="Macho">
                            Macho
                        </option>

                        <option value="Fêmea">
                            Fêmea
                        </option>
                    </select>
                </div>

                <label className="flex items-center gap-3">

                    <input
                        type="checkbox"
                        name="castrado"
                        checked={formulario.castrado}
                        onChange={handleChange}
                        className="h-4 w-4"
                    />

                    <span className="text-sm font-medium text-gray-700">
                        Pet castrado
                    </span>

                </label>

                <div>
                    <label
                        htmlFor="descricao"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Descrição
                    </label>

                    <textarea
                        id="descricao"
                        name="descricao"
                        rows="4"
                        value={formulario.descricao}
                        onChange={handleChange}
                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
                    />
                </div>

                <div className="flex gap-3">

                    <Link
                        to={`/pets/${id}`}
                        className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Cancelar
                    </Link>

                    <button
                        type="submit"
                        disabled={salvando}
                        className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {salvando
                            ? "Salvando..."
                            : "Salvar alterações"}
                    </button>

                </div>

            </form>

        </main>
    );
}