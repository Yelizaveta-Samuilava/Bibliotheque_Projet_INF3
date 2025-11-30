import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Footer from "./components/Footer";

import Login from "./pages/Login";
import Catalogue from "./pages/Catalogue";
import FicheLivre from "./pages/FicheLivre";
import EspaceUtilisateur from "./pages/EspaceUtilisateur";
import Emprunts from "./pages/Emprunts";
import Dashboard from "./pages/Dashboard";

import "./App.css";

function Layout({ children }) {
  const location = useLocation();
  const hideFooter = location.pathname === "/login"; // footer invisible sur login si tu veux

  return (
    <>
      <main style={{ minHeight: "85vh" }}>
        {children}
      </main>

      {/* Footer partout sauf login */}
      {!hideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/livre/:id" element={<FicheLivre />} />
            <Route path="/espace-utilisateur" element={<EspaceUtilisateur />} />
            <Route path="/emprunts" element={<Emprunts />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="*" element={<Login />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
