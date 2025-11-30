import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";

const EspaceUtilisateur = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [emprunts, setEmprunts] = useState([]);
  const [livres, setLivres] = useState([]);

  useEffect(() => {
    if (!user) return;

    if (user.role !== "admin") {
      fetch(`http://localhost:8000/emprunts/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setEmprunts(Array.isArray(data) ? data : (data.emprunts || [])))
        .catch(err => console.error(err));
    } else {
      fetch(`http://localhost:8000/livres`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setLivres(data))
        .catch(err => console.error(err));
    }
  }, [user, token]);

  const rendreLivre = (idEmprunt) => {
    fetch(`http://localhost:8000/emprunts/rendre/${idEmprunt}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(() => setEmprunts(prev => prev.filter(e => e._id !== idEmprunt)))
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    logout();
    navigate("/login"); // redirection vers login
  };

  // Evite crash si user non défini
  if (!user) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <Header />
      <h1>{user.role === "admin" ? "Espace Admin" : "Espace Utilisateur"}</h1>

      <div className="espace-user-info">
        <h2>Mes informations</h2>
        <p><strong>Nom :</strong> {user.nom}</p>
        <p><strong>Email :</strong> {user.email}</p>
        <p><strong>Rôle :</strong> {user.role}</p>
        <button onClick={handleLogout}>Se déconnecter</button>
      </div>

      {user.role === "admin" ? (
        <div className="admin-livres">
          <h2>Gestion des livres</h2>
          <button onClick={() => console.log("Ajouter un livre")}>Ajouter un livre</button>
          <div className="livres-container">
            {livres.map(livre => (
              <div key={livre._id} className="livre-card">
                <h3>{livre.titre}</h3>
                <p>Auteur: {livre.auteur}</p>
                <p>Catégorie: {livre.categorie_id}</p>
                <p>Année: {livre.annee}</p>
                <p>Disponibilité: {livre.disponible ? "Disponible" : "Indisponible"}</p>
                <button onClick={() => console.log("Modifier", livre._id)}>Modifier</button>
                <button onClick={() => console.log("Supprimer", livre._id)}>Supprimer</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="espace-user-emprunts">
          <h2>Mes emprunts</h2>
          {emprunts.length === 0 ? (
            <p>Aucun emprunt pour le moment.</p>
          ) : (
            <div className="emprunts-container">
              {emprunts.map(e => (
                <div key={e._id} className="emprunt-card">
                  <h3>{e.livre?.titre || "Livre inconnu"}</h3>
                  <p><strong>Date d’emprunt :</strong> {e.date_emprunt}</p>
                  <p><strong>Retour prévu :</strong> {e.date_retour}</p>
                  <button onClick={() => rendreLivre(e._id)}>Rendre le livre</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EspaceUtilisateur;
