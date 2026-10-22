
export default function AgendamentosAdmin() {
    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold text-[#1B3347]">
                    Agendamentos
                </h1>

                <p className="mt-2 text-gray-600">
                    Gerencie as solicitações de hospedagem e creche.
                </p>

                <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                    <h2 className="text-lg font-semibold text-[#1B3347]">
                        Solicitações de agendamento
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                        Nesta área serão exibidas as solicitações pendentes,
                        os dados dos pets e tutores e as opções para aprovar
                        ou recusar cada pedido.
                    </p>

                    <p className="mt-4 text-sm text-gray-500">
                        A conexão com os agendamentos do Supabase será
                        implementada na próxima etapa.
                    </p>
                </div>
            </div>
        </div>
    );
}
