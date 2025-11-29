from pydantic import BaseModel

class Utilisateur(BaseModel):
    _id: int
    nom: str
    prenom: str
    email: str
    mot_de_passe: str
    role: str

# Modèle pour le login (juste email + mot de passe)
class LoginUtilisateur(BaseModel):
    email: str
    mot_de_passe: str