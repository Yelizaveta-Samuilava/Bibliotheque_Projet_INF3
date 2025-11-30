import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";

const Emprunts = () => {
  const { user, token } = useContext(AuthContext);
  const [emprunts, setEmprunts] = useState([]);

  // Récupérer les emprunts de l'utilisateur connecté
  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:8000/emprunts/user/${user._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEmprunts(Array.isArray(data) ? data : data.emprunts || []);
      })
      .catch((err) => console.error(err));
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



  if (!user) return <p>Chargement...</p>;

  return (
    <div>
      <Header />
      <h1 className="emprunts-title">Mes emprunts</h1>

      {emprunts.length === 0 ? (
        <p style={{ textAlign: "center" }}>Aucun emprunt pour le moment.</p>
      ) : (
        <div className="emprunts-container">
          {emprunts.map((e) => (
            <div key={e._id} className="emprunt-card">
              <h3>{e.livre?.titre || "Livre inconnu"}</h3>
              <p>
                <strong>Date d’emprunt :</strong>{" "}
                {new Date(e.date_emprunt).toLocaleDateString()}
              </p>
              <p>
                <strong>Retour prévu :</strong>{" "}
                {new Date(e.date_retour).toLocaleDateString()}
              </p>
              <p>
                <strong>Statut :</strong>{" "}
                {e.statut === "retard"
                  ? "En retard"
                  : e.statut === "rendu"
                  ? "Rendu"
                  : "En cours"}
              </p>
              <button onClick={() => rendreLivre(e._id)}>Rendre le livre</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Emprunts;
