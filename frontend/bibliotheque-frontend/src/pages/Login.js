import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";


const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" ou "register"
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "",
    role: "etudiant",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let url = "http://localhost:8000/utilisateurs/";
      let options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      };

      if (mode === "login") {
        url += "login";
        const res = await fetch(url, options);
        const data = await res.json();
        if (!res.ok) throw data;
        login(data.token, data.user);
        navigate("/espace-utilisateur");
      } else {
        const res = await fetch(url, options);
        const data = await res.json();
        if (!res.ok) throw data;
        alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      if (err.detail) setError(err.detail);
      else setError("Erreur serveur");
    }
  };

  return (
  <div className="login-page">
      <Header />

      <div className="login-container">
        <h2>{mode === "login" ? "Connexion" : "Inscription"}</h2>
        {error && <p className="error">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <input
                type="text"
                name="nom"
                placeholder="Nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="prenom"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="mot_de_passe"
            placeholder="Mot de passe"
            value={formData.mot_de_passe}
            onChange={handleChange}
            required
          />

          {mode === "register" && (
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="etudiant">Étudiant</option>
              <option value="professeur">Professeur</option>
              <option value="admin">Admin</option>
            </select>
          )}

          <button type="submit">
            {mode === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        <div className="switch-mode">
          <p>
            {mode === "login" ? "Pas encore inscrit ?" : "Déjà inscrit ?"}{" "}
            <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Créer un compte" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>

      <Footer />
  </div>
);

};

export default Login;
