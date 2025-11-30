import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleProtectedClick = (path) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <header className="header">
      <div className="logo">FastLib</div>

      <nav>
        <ul>
          <li>
            <Link to="/catalogue" className="nav-link">Catalogue</Link>
          </li>
          <li>
            <button
              className="nav-link"
              onClick={() => handleProtectedClick("/emprunts")}
            >
              Mes emprunts
            </button>
          </li>
          <li>
            <button
              className="nav-link"
              onClick={() => handleProtectedClick("/espace-utilisateur")}
            >
              Espace utilisateur
            </button>
          </li>
          <li>
            <Link to="/dashboard" className="nav-link">Tableau de bord</Link>
          </li>
          {user ? (
            <li>
              <button className="logout-button" onClick={logout}>Déconnexion</button>
            </li>
          ) : (
            <li>
              <Link to="/login" className="nav-link">Connexion</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
