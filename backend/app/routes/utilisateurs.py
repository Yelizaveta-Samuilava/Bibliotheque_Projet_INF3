from fastapi import APIRouter
from database import utilisateurs
from models.utilisateur import Utilisateur

router = APIRouter(prefix="/utilisateurs")

@router.get("/")
def get_utilisateurs():
    # Récupérer tous les utilisateurs
    return list(utilisateurs.find({}, {"_id": 1, "nom": 1, "prenom": 1, "email": 1, "role": 1}))

@router.post("/")
def add_utilisateur(data: Utilisateur):
    # Récupérer le dernier utilisateur trié par _id décroissant
    dernier_utilisateur = utilisateurs.find_one(sort=[("_id", -1)])
    
    # Définir l'_id du nouvel utilisateur
    data_dict = data.dict()
    data_dict["_id"] = (dernier_utilisateur["_id"] + 1) if dernier_utilisateur else 1
    
    utilisateurs.insert_one(data_dict)
    return {"message": "Utilisateur ajouté", "id": data_dict["_id"]}
