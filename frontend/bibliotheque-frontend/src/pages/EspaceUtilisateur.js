import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";

const EspaceUtilisateur = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [emprunts, setEmprunts] = useState([]);
  const [livres, setLivres] = useState([]);
  const [newLivre, setNewLivre] = useState({
    titre: "",
    auteur_id: "",
    categorie_id: "",
    annee: "",
    stock: 1
  });

  useEffect(() => {
    if (!user) return;

    if (user.role !== "admin") {
      // Récupérer les emprunts de l'utilisateur
      fetch(`http://localhost:8000/emprunts/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setEmprunts(Array.isArray(data) ? data : (data.emprunts || [])))
        .catch(err => console.error(err));
    } else {
      // Récupérer tous les livres pour l'admin
      fetch(`http://localhost:8000/livres`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setLivres(data))
        .catch(err => console.error(err));
    }
  }, [user, token]);

  // Fonction pour rendre un livre
const rendreLivre = async (idEmprunt) => {
  try {
    const res = await fetch("http://localhost:8000/emprunts/rendre", {
      method: "POST",                   // POST obligatoire
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ emprunt_id: parseInt(idEmprunt) }),  // parseInt très important
    });

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.detail || "Erreur lors du rendu du livre");
      return;
    }

    const data = await res.json();
    // Supprimer l’emprunt rendu de la liste locale
    setEmprunts(prev => prev.filter(e => e._id !== idEmprunt));
    console.log("Livre rendu :", data);
  } catch (err) {
    console.error("Erreur serveur :", err);
    alert("Erreur serveur : impossible de contacter le backend");
  }
};


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAddLivre = () => {
    fetch("http://localhost:8000/livres", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newLivre)
    })
      .then(res => res.json())
      .then(data => {
        setLivres(prev => [...prev, data.livre]);
        setNewLivre({ titre: "", auteur_id: "", categorie_id: "", annee: "", stock: 1 });
      })
      .catch(err => console.error(err));
  };

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

          {/* Formulaire ajout livre */}
          <div className="ajout-livre-form">
            <input
              type="text"
              placeholder="Titre"
              value={newLivre.titre}
              onChange={e => setNewLivre({ ...newLivre, titre: e.target.value })}
            />
            <input
              type="number"
              placeholder="ID Auteur"
              value={newLivre.auteur_id}
              onChange={e => setNewLivre({ ...newLivre, auteur_id: parseInt(e.target.value) })}
            />
            <input
              type="number"
              placeholder="ID Catégorie"
              value={newLivre.categorie_id}
              onChange={e => setNewLivre({ ...newLivre, categorie_id: parseInt(e.target.value) })}
            />
            <input
              type="number"
              placeholder="Année"
              value={newLivre.annee}
              onChange={e => setNewLivre({ ...newLivre, annee: parseInt(e.target.value) })}
            />
            <input
              type="number"
              placeholder="Stock"
              value={newLivre.stock}
              onChange={e => setNewLivre({ ...newLivre, stock: parseInt(e.target.value) })}
            />
            <button onClick={handleAddLivre}>Ajouter le livre</button>
          </div>

          <div className="livres-container">
            {livres.map(livre => (
              <div key={livre._id} className="livre-card">
                <h3>{livre.titre}</h3>
                <p>Auteur: {livre.auteur}</p>
                <p>Catégorie: {livre.categorie_nom}</p>
                <p>Année: {livre.annee}</p>
                <p>Stock: {livre.stock}</p>
                <p>Disponibilité: {livre.disponible ? "Disponible" : "Indisponible"}</p>
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
                  <p><strong>Date d’emprunt :</strong> {new Date(e.date_emprunt).toLocaleDateString()}</p>
                  <p><strong>Retour prévu :</strong> {new Date(e.date_retour).toLocaleDateString()}</p>
                  <p><strong>Statut :</strong> {e.statut === "retard" ? "En retard" : e.statut === "rendu" ? "Rendu" : "En cours"}</p>
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
