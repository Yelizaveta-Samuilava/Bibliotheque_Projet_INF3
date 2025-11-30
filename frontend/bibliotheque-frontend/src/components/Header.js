import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="logo">FastLib</div>

      <nav>
        <ul>
          <li>
            <Link to="/catalogue">Catalogue</Link>
          </li>
          <li>
            <Link to="/emprunts">Mes emprunts</Link>
          </li>
          <li>
            <Link to="/espace-utilisateur">Espace utilisateur</Link>
          </li>
          <li>
            <Link to="/statistiques">Tableau de bord</Link>
          </li>
          {user ? (
            <li>
              <button onClick={logout}>Déconnexion</button>
            </li>
          ) : (
            <li>
              <Link to="/login">Connexion</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
