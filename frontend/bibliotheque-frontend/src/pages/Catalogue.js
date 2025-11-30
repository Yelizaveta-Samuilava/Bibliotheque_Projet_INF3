import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";

const Catalogue = () => {
  const [livres, setLivres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    titre: "",
    auteur: "",
    categorie_id: "",
    disponible: "",
    mots_cles: ""
  });

  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  // Charger les catégories (pour le menu déroulant)
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8000/categories/");
      const data = await res.json();
      setCategories(data); // tableau de { _id, nom }
    } catch (err) {
      console.error("Erreur chargement catégories :", err);
    }
  };

  // Récupérer les livres
  const fetchLivres = async (useFilters = false) => {
    try {
      let url = "http://localhost:8000/livres/";

      if (useFilters) {
        const params = new URLSearchParams();

        if (filters.titre.trim() !== "") params.append("titre", filters.titre.trim());
        if (filters.auteur.trim() !== "") params.append("auteur", filters.auteur.trim());
        if (filters.categorie_id !== "")
          params.append("categorie_id", filters.categorie_id);
        if (filters.disponible === "true") params.append("disponible", "true");
        if (filters.disponible === "false") params.append("disponible", "false");
        if (filters.mots_cles.trim() !== "") params.append("mots_cles", filters.mots_cles.trim());

        url = `http://localhost:8000/livres/search?${params.toString()}`;
      }

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const data = await res.json();
      const livresData = Array.isArray(data) ? data : data.livres;

      setLivres(
        livresData.map((l) => ({
          ...l,
          categorie: l.categorie_nom || "Inconnue",
          auteur: l.auteur || "Inconnu"
        }))
      );
    } catch (err) {
      console.error("Erreur lors du fetch des livres :", err);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchCategories();
    fetchLivres();
  }, [token]);

  // Formulaire
  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchLivres(true);
  };

  const handleReset = () => {
    setFilters({
      titre: "",
      auteur: "",
      categorie_id: "",
      disponible: "",
      mots_cles: ""
    });
    fetchLivres(false);
  };

  return (
    <div>
      <Header />
      <h1 className="catalogue-title">Catalogue des livres</h1>

      {/* Formulaire de recherche */}
      <form onSubmit={handleSubmit} className="recherche-form">
        
        <input
          type="text"
          name="titre"
          placeholder="Titre"
          value={filters.titre}
          onChange={handleChange}
        />

        <input
          type="text"
          name="auteur"
          placeholder="Auteur"
          value={filters.auteur}
          onChange={handleChange}
        />

        {/* MENU DÉROULANT POUR LES CATÉGORIES */}
        <select
          name="categorie_id"
          value={filters.categorie_id}
          onChange={handleChange}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.nom}
            </option>
          ))}
        </select>

        <select name="disponible" value={filters.disponible} onChange={handleChange}>
          <option value="">Tous</option>
          <option value="true">Disponible</option>
          <option value="false">Indisponible</option>
        </select>

        <input
          type="text"
          name="mots_cles"
          placeholder="Mots-clés"
          value={filters.mots_cles}
          onChange={handleChange}
        />

        <button type="submit">Rechercher</button>
        <button type="button" onClick={handleReset}>
          Réinitialiser
        </button>
      </form>

      {/* Affichage du catalogue */}
      <div className="catalogue-container">
        {livres.length === 0 ? (
          <p>Aucun livre trouvé.</p>
        ) : (
          livres.map((livre) => (
            <div key={livre._id} className="livre-card">
              <h3>{livre.titre}</h3>
              <p><strong>Auteur :</strong> {livre.auteur}</p>
              <p><strong>Catégorie :</strong> {livre.categorie}</p>
              <p><strong>Disponibilité :</strong> {livre.disponible ? "Disponible" : "Indisponible"}</p>

              <button onClick={() => navigate(`/livre/${livre._id}`)}>Voir plus</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Catalogue;
