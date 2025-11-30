import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { loginUser } from "../api/utilisateurs";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // peut être string ou objet
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // reset erreur à chaque submit
    try {
      const data = await loginUser(email, password);
      login(data.token, data.user);
      navigate("/espace-utilisateur"); // au lieu de /catalogue
; // redirige vers le catalogue après login
    } catch (err) {
      // err peut être un objet provenant de Axios/FastAPI
      if (err.response && err.response.data) {
        setError(err.response.data); 
      } else {
        setError("Erreur lors de la connexion");
      }
    }
  };

  const renderError = () => {
    if (!error) return null;
    if (typeof error === "string") return error;
    if (typeof error === "object") {
      // Affiche le message principal de l'objet d'erreur
      return error.detail || error.msg || JSON.stringify(error);
    }
    return "Erreur inconnue";
  };

  return (
    <div>
      <h2>Connexion</h2>
      {error && <p style={{ color: "red" }}>{renderError()}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default Login;
