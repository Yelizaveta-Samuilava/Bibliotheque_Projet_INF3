from fastapi import APIRouter, HTTPException
from database import utilisateurs
from models.utilisateur import Utilisateur, LoginUtilisateur

router = APIRouter(prefix="/utilisateurs")

# Récupérer tous les utilisateurs
@router.get("/")
def get_utilisateurs():
    return list(
        utilisateurs.find(
            {},
            {"_id": 1, "nom": 1, "prenom": 1, "email": 1, "role": 1}
        )
    )

# Ajouter un nouvel utilisateur (inscription)
@router.post("/")
def add_utilisateur(data: Utilisateur):
    # Récupérer le dernier utilisateur trié par _id décroissant
    dernier_utilisateur = utilisateurs.find_one(sort=[("_id", -1)])
    
    # Définir l'_id du nouvel utilisateur
    data_dict = data.dict()
    data_dict["_id"] = (dernier_utilisateur["_id"] + 1) if dernier_utilisateur else 1
    
    utilisateurs.insert_one(data_dict)
    return {"message": "Utilisateur ajouté", "id": data_dict["_id"]}

# Connexion utilisateur (login)
@router.post("/login")
def login(data: LoginUtilisateur):
    user = utilisateurs.find_one(
        {"email": data.email, "mot_de_passe": data.mot_de_passe},
        {"_id": 1, "nom": 1, "prenom": 1, "email": 1, "role": 1}
    )
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    return {
        "message": "Connexion réussie",
        "user": user
    }
