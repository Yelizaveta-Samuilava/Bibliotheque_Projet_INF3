from pydantic import BaseModel

class Auteur(BaseModel):
    _id: int
    nom: str
    annee_naissance: int
    biographie: str
