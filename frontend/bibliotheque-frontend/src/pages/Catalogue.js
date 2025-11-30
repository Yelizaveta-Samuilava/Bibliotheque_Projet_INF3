import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

const Catalogue = () => {
  const [livres, setLivres] = useState([]);
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    // Récupérer tous les livres depuis le backend
    fetch("http://localhost:8000/livres/") 
      .then(res => res.json())
      .then(data => {
        // si ton backend renvoie auteur et categorie_nom
        const formatted = data.map(l => ({
          ...l,
          categorie: l.categorie_nom || "Inconnue",
          auteur: l.auteur || "Inconnu"
        }));
        setLivres(formatted);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <Header />
      <h1 className="catalogue-title">Catalogue des livres</h1>

      <div className="catalogue-container">
        {livres.map((livre) => (
          <div key={livre._id} className="livre-card">
            <h3>{livre.titre}</h3>
            <p><strong>Auteur :</strong> {livre.auteur}</p>
            <p><strong>Catégorie :</strong> {livre.categorie}</p>
            <p><strong>Disponibilité :</strong> {livre.disponible ? "Disponible" : "Indisponible"}</p>
            <button onClick={() => navigate(`/livre/${livre._id}`)}>
              Voir plus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalogue;
