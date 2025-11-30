import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/utilisateurs/login`, {
      email,
      mot_de_passe: password,
    });

    const data = response.data;

    // Retourne l'objet complet renvoyé par le backend
    return {
      token: "fake-token", // placeholder si pas de JWT
      user: {
        _id: data.user._id,
        nom: data.user.nom,
        prenom: data.user.prenom,
        email: data.user.email,
        role: data.user.role,
      },
    };
  } catch (error) {
    throw error.response?.data || { detail: "Erreur lors de la connexion" };
  }
};
