from pydantic import BaseModel

class Auteur(BaseModel):
    _id: int 
    nom: str
    prenom: str 
