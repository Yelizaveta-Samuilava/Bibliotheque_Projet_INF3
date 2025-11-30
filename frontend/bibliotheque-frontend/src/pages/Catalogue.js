import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Catalogue = () => {
  const [livres, setLivres] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer tous les livres depuis ton backend
    fetch("http://127.0.0.1:8000/livres/") // adapte l'URL si nécessaire
      .then(res => res.json())
      .then(data => setLivres(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <Header />
      <h1>Catalogue des livres</h1>
      <div className="catalogue-container">
        {livres.map((livre) => (
          <div key={livre._id} className="livre-card">
            <h3>{livre.titre}</h3>
            <p>Auteur: {livre.auteur}</p>
            <p>Catégorie: {livre.categorie}</p>
            <p>Disponibilité: {livre.disponible ? "Disponible" : "Indisponible"}</p>
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
