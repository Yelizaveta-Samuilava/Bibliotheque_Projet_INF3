from fastapi import APIRouter
from database import livres
from models.livre import Livre

router = APIRouter(prefix="/livres")

@router.get("/")
def get_livres():
    return list(livres.find())

@router.post("/")
def add_livre(data: Livre):
    livre_dict = data.dict()

    # Si l'utilisateur ne fournit pas d'_id
    if not livre_dict.get("_id"):
        # Cherche le dernier _id qui est un entier
        dernier_livre = livres.find({"_id": {"$type": "int"}}).sort("_id", -1).limit(1)
        dernier_livre = list(dernier_livre)
        livre_dict["_id"] = (dernier_livre[0]["_id"] + 1) if dernier_livre else 1

    livres.insert_one(livre_dict)
    return {"message": "Livre ajouté", "livre": livre_dict}
