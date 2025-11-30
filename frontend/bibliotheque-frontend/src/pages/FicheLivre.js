import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";

const FicheLivre = () => {
  const { id } = useParams(); // récupère l'ID du livre depuis l'URL
  const [livre, setLivre] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/livres/${parseInt(id)}`)
      .then(res => res.json())
      .then(data => setLivre(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!livre) return <p>Chargement...</p>;

  return (
    <div>
      <Header />
      <h1>{livre.titre}</h1>
      <p>Auteur: {livre.auteur}</p>
      <p>Catégorie: {livre.categorie}</p>
      <p>Année: {livre.annee}</p>
      <p>Disponibilité: {livre.disponible ? "Disponible" : "Indisponible"}</p>
      <button disabled={!livre.disponible}>
        Emprunter
      </button>
    </div>
  );
};

export default FicheLivre;
