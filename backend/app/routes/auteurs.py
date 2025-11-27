from fastapi import APIRouter, HTTPException
from database import auteurs  # ta collection MongoDB "auteurs"
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/auteurs", tags=["Auteurs"])

# Modèle Pydantic
class Auteur(BaseModel):
    _id: Optional[int]
    nom: str

# GET /auteurs
@router.get("/", response_model=List[Auteur])
def get_auteurs():
    return list(auteurs.find())

# POST /auteurs
@router.post("/", response_model=Auteur)
def add_auteur(data: Auteur):
    auteur_dict = data.dict()
    if not auteur_dict.get("_id"):
        last = auteurs.find_one(sort=[("_id", -1)])
        auteur_dict["_id"] = (last["_id"] + 1) if last else 1
    auteurs.insert_one(auteur_dict)
    return auteur_dict
