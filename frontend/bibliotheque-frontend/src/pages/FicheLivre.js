import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

const FicheLivre = () => {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const [livre, setLivre] = useState(null);
  const [emprunte, setEmprunte] = useState(false); // bouton désactivé après emprunt

  // Récupération du livre
  useEffect(() => {
    fetch(`http://localhost:8000/livres/${parseInt(id)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setLivre({
          ...data,
          categorie: data.categorie_nom || "Inconnue",
          auteur: data.auteur || "Inconnu"
        });
      })
      .catch(err => console.error(err));
  }, [id, token]);

  const emprunterLivre = async () => {
    if (!user) {
      alert("Veuillez vous connecter pour emprunter un livre.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/emprunts/emprunter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          utilisateur_id: user._id,
          livre_id: livre._id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Erreur lors de l'emprunt");
      } else {
        alert("Livre emprunté avec succès !");
        setEmprunte(true);
        // Mettre à jour la disponibilité et le stock en fonction de la réponse du backend
        setLivre(prev => ({
          ...prev,
          disponible: data.livre_disponible !== undefined ? data.livre_disponible : false,
          stock: data.livre_stock !== undefined ? data.livre_stock : Math.max(prev.stock - 1, 0)
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Erreur serveur lors de l'emprunt");
    }
  };

  if (!livre) return <p>Chargement...</p>;

  return (
    <div>
      <Header />
      <div className="fiche-livre-container">
        <h1>{livre.titre}</h1>
        <p><strong>Auteur :</strong> {livre.auteur}</p>
        <p><strong>Catégorie :</strong> {livre.categorie}</p>
        <p><strong>Année :</strong> {livre.annee}</p>
        <p><strong>Disponibilité :</strong> {livre.disponible ? "Disponible" : "Indisponible"}</p>
        <button 
          disabled={!livre.disponible || emprunte} 
          onClick={emprunterLivre}
        >
          {livre.disponible && !emprunte ? "Emprunter" : "Emprunté"}
        </button>
      </div>
    </div>
  );
};

export default FicheLivre;
