from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class EmpruntEmbedded(BaseModel):
    livre_id: int
    date_emprunt: datetime
    date_retour: Optional[datetime] = None
    statut: str


class Utilisateur(BaseModel):
    _id: int
    nom: str
    prenom: str
    email: str
    mot_de_passe: str
    role: str
    emprunts: Optional[List[EmpruntEmbedded]] = []

# Modèle pour le login (juste email + mot de passe)
class LoginUtilisateur(BaseModel):
    email: str
    mot_de_passe: str