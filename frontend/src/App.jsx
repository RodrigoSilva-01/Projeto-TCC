import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import EquipeRoute from "./components/EquipeRoute";
import RedirecionarUsuario from "./components/RedirecionarUsuario";

import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import Pets from "./pages/Pets";
import PetDetalhes from "./pages/PetDetalhes";
import PetEditar from "./pages/PetEditar";
import SaudePet from "./pages/SaudePet";
import AlimentacaoPet from "./pages/AlimentacaoPet";
import RotinaPet from "./pages/RotinaPet";
import HigienePet from "./pages/HigienePet";
import ComportamentoPet from "./pages/ComportamentoPet";
import EmergenciaPet from "./pages/EmergenciaPet";
import Agendamentos from "./pages/Agendamentos";
import Historico from "./pages/Historico";
import Perfil from "./pages/Perfil";

import DashboardAdmin from "./pages/DashboardAdmin";
import AgendamentosAdmin from "./pages/AgendamentosAdmin";
import ConfiguracoesEmpresa from "./pages/ConfiguracoesEmpresa";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas para autenticação */}
          <Route
            path="/:slug/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />

          <Route
            path="/:slug/cadastro"
            element={
              <GuestRoute>
                <Cadastro />
              </GuestRoute>
            }
          />

          {/* Redirecionamento conforme o perfil */}
          <Route
            path="/redirecionar"
            element={<RedirecionarUsuario />}
          />

          {/* Área do tutor */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/"
              element={
                <RedirecionarUsuario mostrarHomeCliente />
              }
            />

            <Route path="/pets" element={<Pets />} />
            <Route path="/pets/:id" element={<PetDetalhes />} />
            <Route path="/pets/:id/editar" element={<PetEditar />} />

            <Route path="/pets/:id/saude" element={<SaudePet />} />
            <Route
              path="/pets/:id/alimentacao"
              element={<AlimentacaoPet />}
            />
            <Route path="/pets/:id/rotina" element={<RotinaPet />} />
            <Route path="/pets/:id/higiene" element={<HigienePet />} />
            <Route
              path="/pets/:id/comportamento"
              element={<ComportamentoPet />}
            />
            <Route
              path="/pets/:id/emergencia"
              element={<EmergenciaPet />}
            />

            <Route
              path="/agendamentos"
              element={<Agendamentos />}
            />
            <Route path="/historico" element={<Historico />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>

          {/* Área administrativa: fora do Layout dos tutores */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <EquipeRoute>
                  <DashboardAdmin />
                </EquipeRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/agendamentos"
            element={
              <ProtectedRoute>
                <EquipeRoute>
                  <AgendamentosAdmin />
                </EquipeRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/configuracoes"
            element={
              <ProtectedRoute>
                <EquipeRoute apenasAdmin>
                  <ConfiguracoesEmpresa />
                </EquipeRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
