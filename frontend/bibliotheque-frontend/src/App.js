import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Catalogue from "./pages/Catalogue";
import FicheLivre from "./pages/FicheLivre"; // <- assure-toi d'importer ton composant
import EspaceUtilisateur from "./pages/EspaceUtilisateur";
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/livre/:id" element={<FicheLivre />} />
          <Route path="/espace-utilisateur" element={<EspaceUtilisateur />} />


          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
