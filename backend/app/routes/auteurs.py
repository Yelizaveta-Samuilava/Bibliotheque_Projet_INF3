from fastapi import APIRouter, HTTPException
from database import auteurs  # ta collection MongoDB "auteurs"
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/auteurs", tags=["Auteurs"])

# Modèle Pydantic
class Auteur(BaseModel):
    _id: int
    nom: str
    annee_naissance: int
    biographie: str

# GET /auteurs
@router.get("/", response_model=List[Auteur])
def get_auteurs():
    result = []
    for doc in auteurs.find():
        doc["_id"] = str(doc["_id"])  # conversion ObjectId -> str
        result.append(doc)
    return result

# POST /auteurs
@router.post("/", response_model=Auteur)
def add_auteur(data: Auteur):
    auteur_dict = data.dict(exclude={"_id"})  # on laisse MongoDB générer _id
    inserted = auteurs.insert_one(auteur_dict)
    auteur_dict["_id"] = str(inserted.inserted_id)
    return auteur_dict
