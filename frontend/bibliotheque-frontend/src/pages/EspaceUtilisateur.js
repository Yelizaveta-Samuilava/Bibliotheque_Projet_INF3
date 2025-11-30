import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // <-- ajoute ça
import Header from "../components/Header";

const EspaceUtilisateur = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [emprunts, setEmprunts] = useState([]);
  const navigate = useNavigate(); // <-- initialise navigate

  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:8000/emprunts/user/${user._id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setEmprunts(Array.isArray(data) ? data : (data.emprunts || []));
      })
      .catch(err => console.error(err));
  }, [user, token]);

  const rendreLivre = (idEmprunt) => {
    fetch(`http://localhost:8000/emprunts/rendre/${idEmprunt}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => res.json())
      .then(() => {
        setEmprunts(prev => prev.filter(e => e._id !== idEmprunt));
      })
      .catch(err => console.error(err));
  };

  // Nouvelle fonction pour logout + redirection
  const handleLogout = () => {
    logout();          // supprime le token et user
    navigate("/login"); // redirige vers login
  };

  if (!user) return <p>Chargement...</p>;

  return (
    <div>
      <Header />

      <h1>Espace utilisateur</h1>

      <div className="espace-user-info">
        <h2>Mes informations</h2>
        <p><strong>Nom :</strong> {user.nom}</p>
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>Rôle :</strong> {user.role}</p>

        {/* Utilise la nouvelle fonction */}
        <button className="logout-btn" onClick={handleLogout}>Se déconnecter</button>
      </div>

      <div className="espace-user-emprunts">
        <h2>Mes emprunts</h2>
        {emprunts.length === 0 ? (
          <p>Aucun emprunt pour le moment.</p>
        ) : (
          <div className="emprunts-container">
            {emprunts.map((e) => (
              <div className="emprunt-card" key={e._id}>
                <h3>{e.livre?.titre || "Livre inconnu"}</h3>
                <p><strong>Date d’emprunt :</strong> {e.date_emprunt}</p>
                <p><strong>Retour prévu :</strong> {e.date_retour}</p>

                <button onClick={() => rendreLivre(e._id)}>Rendre le livre</button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default EspaceUtilisateur;
