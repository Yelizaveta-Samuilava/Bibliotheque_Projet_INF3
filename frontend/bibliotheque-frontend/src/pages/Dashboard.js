import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import Header from "../components/Header";

const Dashboard = () => {
  const [topLivres, setTopLivres] = useState([]);
  const [statsCategorie, setStatsCategorie] = useState([]);
  const [moyenneParLivre, setMoyenneParLivre] = useState(0);
  const [moyenneParUtilisateur, setMoyenneParUtilisateur] = useState(0);
  const [topAuteurs, setTopAuteurs] = useState([]);

  useEffect(() => {
    // Top livres empruntés
    fetch("http://localhost:8000/stats/top-livres")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(item => ({
          titre: item.livre.titre,
          count: item.nb_emprunts
        }));
        setTopLivres(formatted);
      });

    // Stats par catégorie
    fetch("http://localhost:8000/stats/emprunts-par-categorie")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(item => ({
          categorie: item.categorie_nom,
          count: item.nb_emprunts
        }));
        setStatsCategorie(formatted);
      });

    // Durée moyenne par livre
    fetch("http://localhost:8000/stats/duree-moyenne-livre")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const moyenne = data.reduce((acc, item) => acc + item.moyenne_duree_jours, 0) / data.length;
          setMoyenneParLivre(moyenne);
        }
      });

    // Durée moyenne par utilisateur
    fetch("http://localhost:8000/stats/duree-moyenne-utilisateur")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const moyenne = data.reduce((acc, item) => acc + item.moyenne_duree_jours, 0) / data.length;
          setMoyenneParUtilisateur(moyenne);
        }
      });

    // Top auteurs
    fetch("http://localhost:8000/stats/top-auteurs")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(item => ({
          auteur: item._id,
          count: item.nb_emprunts
        }));
        setTopAuteurs(formatted);
      });
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

  return (
    <div>
      <Header />
      <h1 style={{ textAlign: "center", margin: "30px 0", color: "#6b4226", textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
        Tableau de bord
      </h1>

      <div className="dashboard-container">

        {/* Top livres */}
        <div className="dashboard-card">
          <h2>Top livres empruntés</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topLivres}>
              <XAxis dataKey="titre" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats par catégorie */}
        <div className="dashboard-card">
          <h2>Stats par catégorie</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statsCategorie} dataKey="count" nameKey="categorie" cx="50%" cy="50%" outerRadius={80} label>
                {statsCategorie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Moyenne durée par livre */}
        <div className="dashboard-card">
          <h2>Moyenne durée d’emprunt par livre</h2>
          <div className="moyenne-duree">
            <div className="chiffre">{moyenneParLivre.toFixed(2)}</div>
            <div className="unite">jours</div>
          </div>
        </div>

        {/* Moyenne durée par utilisateur */}
        <div className="dashboard-card">
          <h2>Moyenne durée d’emprunt par utilisateur</h2>
          <div className="moyenne-duree">
            <div className="chiffre">{moyenneParUtilisateur.toFixed(2)}</div>
            <div className="unite">jours</div>
          </div>
        </div>

        {/* Top auteurs */}
        <div className="dashboard-card">
          <h2>Top écrivains</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topAuteurs}>
              <XAxis dataKey="auteur" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
