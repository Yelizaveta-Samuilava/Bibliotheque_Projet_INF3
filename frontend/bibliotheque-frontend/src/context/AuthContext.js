import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Trigger pour rafraîchir les pages après un emprunt ou retour
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Charger les infos depuis localStorage au démarrage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error("Erreur JSON parse:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Login : sauvegarde token et user
  const login = (userToken, userData) => {
    setToken(userToken);
    setUser(userData);
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout : supprimer infos
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Helper pour savoir si c'est un admin
  const isAdmin = () => user?.role === "admin";

  // Fonction pour déclencher le rafraîchissement
  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      isAdmin,
      refreshTrigger,
      triggerRefresh
    }}>
      {children}
    </AuthContext.Provider>
  );
};
