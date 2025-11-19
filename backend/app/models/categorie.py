from pydantic import BaseModel

class Categorie(BaseModel):
    _id: int
    nom: str
    description: str
