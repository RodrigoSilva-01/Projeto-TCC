
import {
    CalendarCheck,
    Settings,
    Users,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardAdmin() {
    const {
        usuario,
        ehAdministrador,
    } = useAuth();

    const nome = usuario?.nome?.trim();

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="mx-auto max-w-6xl">

                {/* Cabeçalho */}
                <header className="mb-8">
                    <p className="mb-2 text-sm font-medium text-blue-700">
                        CASAPET104 · ÁREA DA EQUIPE
                    </p>

                    <h1 className="text-3xl font-bold text-[#1B3347]">
                        Olá{nome ? `, ${nome}` : ""}!
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Bem-vindo ao painel de gerenciamento da empresa.
                    </p>
                </header>

                {/* Cartões do painel */}
                <section className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    {/* Agendamentos */}
                    <Link
                        to="/admin/agendamentos"
                        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <CalendarCheck size={25} />
                        </div>

                        <h2 className="text-lg font-semibold text-[#1B3347]">
                            Agendamentos
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            Consulte as solicitações e analise os pedidos
                            enviados pelos tutores.
                        </p>

                        <span className="mt-4 inline-block text-sm font-semibold text-blue-700">
                            Acessar agendamentos →
                        </span>
                    </Link>

                    {/* Pets e tutores */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <Users size={25} />
                        </div>

                        <h2 className="text-lg font-semibold text-[#1B3347]">
                            Pets e tutores
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                            A consulta administrativa dos pets e tutores
                            será integrada na próxima etapa.
                        </p>
                    </div>

                    {/* Configurações — somente administrador */}
                    {ehAdministrador && (
                        <Link
                            to="/admin/configuracoes"
                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                <Settings size={25} />
                            </div>

                            <h2 className="text-lg font-semibold text-[#1B3347]">
                                Configurações da empresa
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                Gerencie horários de funcionamento, serviços,
                                preços, regras de cobrança e capacidade de
                                atendimento.
                            </p>

                            <span className="mt-4 inline-block text-sm font-semibold text-blue-700">
                                Gerenciar configurações →
                            </span>
                        </Link>
                    )}

                </section>
            </div>
        </div>
    );
}
