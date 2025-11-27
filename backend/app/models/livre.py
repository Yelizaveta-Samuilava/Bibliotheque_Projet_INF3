from pydantic import BaseModel

class Livre(BaseModel):
    _id: int 
    titre: str
    auteur_id: int       
    categorie_id: int
    annee: int
    stock: int
    disponible: bool = True
