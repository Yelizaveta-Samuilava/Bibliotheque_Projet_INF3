from pydantic import BaseModel
from datetime import date

class Emprunt(BaseModel):
    _id: int
    utilisateur_id: int
    livre_id: int
    date_emprunt: date
    date_retour: date | None
    statut: str  # "rendu" ou "en cours"
